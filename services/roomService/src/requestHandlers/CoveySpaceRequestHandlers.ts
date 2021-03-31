import assert from 'assert';
import { Socket } from 'socket.io';
import Player from '../types/Player';
import { CoveySpaceList, UserLocation } from '../CoveyTypes';
import CoveyTownListener from '../types/CoveyTownListener';
import CoveyTownsStore from '../lib/CoveyTownsStore';
import CoveySpacesStore from '../lib/CoveySpacesStore';
import CoveySpaceController from '../lib/CoveySpaceController';

/**
 * Request to create a covey space
 */
export interface SpaceCreateRequest {
  coveyTownID: string;
  /** The id for the space that is to be created* */
  coveySpaceID: string;
}

/**
 * Response to a SpaceCreateRequest
 */
export interface SpaceCreateResponse {
  // unimplemented
}

/**
 * Payload sent by client to claim a space within a Town in Covey.Town
 */
 export interface SpaceClaimRequest {
  coveyTownID: string;
  /** The id for the space that is to be claimed* */
  coveySpaceID: string;
  /** The id for the new host (player) for the private space* */
  newHostPlayerID: string;
}

/**
* Response from the server for a space claim request
*/
export interface SpaceClaimResponse {
 // might not need to return anything here 
 // we could just send confirmation in the response envelope
}

/**
 * The format of a request to join a space within a Town in Covey.Town, as dispatched by the server middleware
 */
export interface SpaceJoinRequest {
  /** the id for the town in which the space resides * */
  coveyTownID: string;
  /** the id for the player that would like to join * */
  playerID: string;
  /** ID of the space that the player would like to join * */
  coveySpaceID: string;
}

/**
 * The format of a response to join a Town in Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface SpaceJoinResponse {
  /** current players in a space */
  currentPlayers: Player[];
  /** the id for the player who is the current host of this space * */
  currentHostID: string | null;
  /** the id for the player who is the current presenter in this space */
  currentPresenterID: string | null;
}

/**
 * The format of a request to list the spaces within a Town in Covey.town.
 */
export interface SpaceListRequest {
  coveyTownID: string;
}

/**
 * Response from the server for a space list request
 */
export interface SpaceListResponse {
  // might not need this, may remove or use for added functionality
  spaces: CoveySpaceList;
}

/**
 * Payload sent by the client to delete a Town
 */
export interface SpaceDisbandRequest {
  coveyTownID: string;
  coveySpaceID: string;
}

/**
 * Payload sent by the client to update a space.
 */
export interface SpaceUpdateRequest {
  coveyTownID: string;
  coveySpaceID: string;
  newHost: Player;
  newPresenter: Player;
  newWhitelist: Player[];
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

/**
 * A handler to process the frontend's request to create a private space. 
 * @param requestData an object representing the frontend's request
 */

// john
export async function spaceCreateHandler(requestData: SpaceCreateRequest): Promise<ResponseEnvelope<SpaceCreateResponse>> {
  const spacesStore = CoveySpacesStore.getInstance();

  if (requestData.coveySpaceID.length === 0) {
    return {
      isOK: false,
      message: 'Space ID must be specified',
    };
  }

  spacesStore.createSpace(requestData.coveySpaceID);
  return {
    isOK: true,
    message: `Private Space ${requestData.coveySpaceID} was created`
    // currently not returning a SpaceCreateResponse, but we can change it when we identify what is neccesary to return here 
  };

}

// john
export async function spaceJoinHandler(requestData: SpaceJoinRequest): Promise<ResponseEnvelope<SpaceJoinResponse>> {
  const spacesStore = CoveySpacesStore.getInstance();
  const townsStore = CoveyTownsStore.getInstance();
  const coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);

  if (!coveyTownController) {
    return {
      isOK: false,
      message: 'Error: No such town',
    };
  }

  coveyTownController.joinSpace(requestData.playerID, requestData.coveySpaceID);

  const coveySpaceController = spacesStore.getControllerForSpace(requestData.coveySpaceID);
  if (!coveySpaceController) {
    return {
      isOK: false,
      message: 'Error: No such space',
    };
  }

  return {
    isOK: true,
    response: {
      currentPlayers: coveySpaceController.players,
      currentHostID: coveySpaceController.spaceHostID,
      currentPresenterID: coveySpaceController.presenterID,
    },
  };
}

// john
export async function spaceListHandler(requestData: SpaceListRequest): Promise<ResponseEnvelope<SpaceListResponse>> {
  const spacesStore = CoveySpacesStore.getInstance();

  return {
    isOK: true,
    response: {
      spaces: spacesStore.getSpaces(),
    }
  }
}

// john
export async function spaceClaimHandler(requestData: SpaceClaimRequest): Promise<ResponseEnvelope<SpaceClaimResponse>> {
  const spacesStore = CoveySpacesStore.getInstance();

  const coveySpaceController = spacesStore.getControllerForSpace(requestData.coveySpaceID);
  if (!coveySpaceController) {
    return {
      isOK: false,
      message: 'Error: No such space',
    };
  }

  coveySpaceController.updateSpaceHost(requestData.newHostPlayerID);
  return {
    isOK: true,
    message: `The host was update to be player with ID ${requestData.newHostPlayerID}`,
  };
}

// Curtis
export async function spaceDisbandHandler(requestData: SpaceDisbandRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const spacesStore = CoveySpacesStore.getInstance();

  spacesStore.disbandSpace(requestData.coveySpaceID);

  return {
    isOK: true,
    response: {},
    message: `The space ${requestData.coveySpaceID} was disbanded.`,
  };
}

// anne
export async function spaceUpdateHandler(requestData: SpaceUpdateRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const spacesStore = CoveySpacesStore.getInstance();

  //spaceHost: Player, spacePresenter: Player, whitelist: Player[]
  spacesStore.updateSpace(
    requestData.coveySpaceID, 
    requestData.newHost, 
    requestData.newPresenter, 
    requestData.newWhitelist)

  return {
    isOK: true,
    response: {},
    message: `The space ${requestData.coveySpaceID} was updated.`
  }
}


/**
 * An adapter between CoveyTownController's event interface (CoveyTownListener)
 * and the low-level network communication protocol
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
function spaceSocketAdapter(socket: Socket): CoveySpaceListener {
  
}

/**
 * A handler to process a remote player's subscription to updates for a town
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
export function spaceSubscriptionHandler(socket: Socket): void {
  
}
