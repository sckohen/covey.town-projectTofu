import BodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import io from 'socket.io';
import { spaceClaimHandler, spaceGetForPlayerHandler,spaceJoinHandler,spaceLeaveHandler,spaceListHandler,spaceUnclaimHandler,spaceUpdateHandler } from '../requestHandlers/CoveySpaceRequestHandlers';
import { townCreateHandler,townDeleteHandler,townJoinHandler,townListHandler,townSubscriptionHandler,townUpdateHandler } from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';

export default function addTownRoutes(http: Server, app: Express): io.Server {
  /*
   * Create a new session (aka join a town)
   */
  app.post('/sessions', BodyParser.json(), async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
   * Delete a town
   */
  app.delete('/towns/:townID/:townPassword', BodyParser.json(), async (req, res) => {
    try {
      const result = await townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });
      res.status(200)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(500)
        .json({
          message: 'Internal server error, please see log in server for details',
        });
    }
  });

  /**
   * List all towns
   */
  app.get('/towns', BodyParser.json(), async (_req, res) => {
    try {
      const result = await townListHandler();
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
   * Create a town
   */
  app.post('/towns', BodyParser.json(), async (req, res) => {
    try {
      const result = await townCreateHandler(req.body);
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });
  
  /**
   * Update a town
   */
  app.patch('/towns/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  // This is where the space routing starts
  
  /**
     * List all Spaces
     */
  app.get('/spaces/', BodyParser.json(), async (_req, res) => {
    try {
      const result = await spaceListHandler();
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  /**
     * List the space for the given player
     */
  app.get('/spaces/:playerID', BodyParser.json(), async (req, res) => {
    try {
      const result = await spaceGetForPlayerHandler({
        playerID: req.params.playerID,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });
  
  /**
   * Join a space
   */
  app.put('/spaces/:spaceID/:playerID', BodyParser.json(), async (req, res) => {
    try {
      const result = await spaceJoinHandler({
        playerID: req.params.playerID,
        coveySpaceID: req.params.spaceID,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });
  
  /**
   * Claim a spaces
   */
  app.post('/spaces/claim/:spaceID/:playerID', BodyParser.json(), async (req, res) => {
    try {
      const result = await spaceClaimHandler({
        playerID: req.params.playerID,
        coveySpaceID: req.params.spaceID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Unclaim a spaces
   */
   app.delete('/spaces/claim/:spaceID/:playerID', BodyParser.json(), async (req, res) => {
    try {
      const result = await spaceUnclaimHandler({
        playerID: req.params.playerID,
        coveySpaceID: req.params.spaceID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
     * Leave a space
     */
  app.delete('/spaces/:spaceID/:playerID', BodyParser.json(), async (req, res) => {
    try {
      const result = await spaceLeaveHandler({
        playerID: req.params.playerID,
        coveySpaceID: req.params.spaceID,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });
  
  /**
     * Update a space, also called when we want to:
     * - disband a space
     * - change hosts
     * - change presenters
     */
  app.patch('/spaces/:spaceID', BodyParser.json(), async (req, res) => {
    try {
      const result = await spaceUpdateHandler({
        coveySpaceID: req.params.spaceID,
        playerID: req.body.playerID,
        presenterID: req.body.presenterID,
        whitelist: req.body.whitelist,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;
}
