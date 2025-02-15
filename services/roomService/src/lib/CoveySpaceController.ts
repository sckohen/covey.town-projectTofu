import Player from '../types/Player';
import CoveyTownController from './CoveyTownController';

/**
 * The CoveySpaceController implements  the logic for each space: managing the various events that
 * can occur (e.g. joining a space, moving, leaving a space, becoming host etc.)
 */
export default class CoveySpaceController {
  get spaceHostID(): string | null {
    return this._spaceHostID;
  }
  // gets the ID of the current presenter
  get presenterID(): string | null {
    return this._presenterID;
  }
  // gets the current players in a space
  get players(): Player[] {
    return this._players;
  }
  // gets the ID of the current space
  get coveySpaceID(): string {
    return this._coveySpaceID;
  }
  // gets the list of players that are allowed to enter the private space (whitelist)
  get whitelist(): Player[] {
    return this._whitelist;
  }


  /** The covey town controller of this covey space controller   */
  private _coveyTownController: CoveyTownController;

  /** The list of players currently in the space * */
  private _players: Player[] = [];

  /** The ID given to this space (based on it's declaration on the map) * */
  private readonly _coveySpaceID: string;

  /** The id for the player who is the designated host for this space * */
  private _spaceHostID: string | null;

  /** The id for the player who is the designated by the host to be the presenter * */
  private _presenterID: string | null;

  /** The list of players that are allowed to join this private space * */
  private _whitelist: Player[] = [];

  /** Whether the space is private or not (starts as not private) */
  private _isPrivate = false;

  constructor(coveySpaceID: string, townController: CoveyTownController) {
    this._coveySpaceID = coveySpaceID;
    this._coveyTownController = townController;
    this._spaceHostID = null; // start off as no player until first player enters space
    this._presenterID = null; // start off as no player until host chooses the presenter
  }

  
  /**
   * Finds and returns the player object from the ID
   * @param playerID the ID for the player wanted
   * @returns player object with the given ID
   */
  playerFromID(playerID: string): Player | undefined {
    const player = this._coveyTownController.players.find(p => p.id === playerID);

    return player;
  }


  /**
   * Determines whether player in this space
   * @param playerID the player ID to find the space
   * @returns boolean value for the presence of the player
   */
  isPlayerInSpace(playerID: string): boolean {
    const playerInSpace = this._players.find((player) => player.id === playerID);

    return (playerInSpace !== undefined);
  }

  /**
   * Adds a player to this space
   *
   * @param newPlayerID ID for the new player to add to the space
   * @returns boolean for success or failure
   */
  addPlayer(newPlayerID: string): boolean {
    const newPlayer = this.playerFromID(newPlayerID);

    if (newPlayer !== undefined) {
      // If player is already on the list dont do anything
      if (this._players.includes(newPlayer)) {
        return true; 
      }

      // If the space is not private
      if (this._isPrivate === false) {
        this._players.push(newPlayer);
        return true;
      } if (this._spaceHostID !== null) { // If the space is private and the spaceHost is defined
        if (this.playerFromID(this._spaceHostID) === undefined) { // If the host is no longer in the game
          this.publicizeSpace();
          this._players.push(newPlayer);
          return true;
        } if (this._whitelist.includes(newPlayer) || this.spaceHostID === newPlayerID) {
          this._players.push(newPlayer);
          return true;
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Remove the player specified from the space
   *
   * @param playerID ID of the player to be removed from the space
   */
  removePlayer(playerID: string): void {
    const player = this.playerFromID(playerID);

    if (player !== undefined) {
      this._players = this._players.filter((p) => p.id !== player.id);
    }
  }

  /**
   * Adds a player to the whitelist (list of players allowed to join the private space)
   *
   * @param newPlayer The new player to be add to the whitelist
   */
  addPlayerToWhiteList(newPlayerID: string): Player[] {
    const newPlayer = this.playerFromID(newPlayerID);

    if (newPlayer !== undefined) {
      // If the whitespace already includes the newPlayer, don't add the player, else add the player
      if (this._whitelist.includes(newPlayer)){
        return this._whitelist;
      } 
      this._whitelist.push(newPlayer);
      return this._whitelist;
    }
    return this._whitelist;
  }

  /**
   * Removes a player from the whitelist (list of players allowed to join the private space)
   *
   * @param playerID IF of the player to be removed from the whitelist
   */
  removePlayerFromWhiteList(playerID: string): void {
    const player = this.playerFromID(playerID);

    if (player !== undefined) {
      this._whitelist = this._whitelist.filter((p) => p.id !== player.id);
    }
  }

  /**
    * Changes the host for this space (used for claiming and disbanding space)
    * 
    * @param newHost ID of the player that is the new host
    */
  updateSpaceHost(newHostID: string | null): boolean {
    // Updates the spacehost
    // If the new host is not null, space is set to private
    if (newHostID !== null){
      if (this._spaceHostID === null) { // If the spacehost is not already defined
        this._spaceHostID = newHostID;
        this.disconnectAllPlayersExceptP(newHostID);
        this._isPrivate = true;
        this._coveyTownController.claimSpace(this._coveySpaceID);
        return true;
      } 
      return false; // Else, if the spaceHostID was already defined, fail
    } 
    // Else, if newHostID is null, space is not private
    this.publicizeSpace();
    return true;
  }
  
  /**
    * Changes the presenter for this space
    * 
    * @param newPresenter the player that is the new presenter
    */
  updatePresenter(newPresenterID: string | null): void {
    this._presenterID = newPresenterID;
  }

  /**
   * Changes the whitelist to the desired list given by the host
   * 
   * @param newWhitelist the list of players that are allowed to enter a given space
   */
  updateWhitelist(newWhitelist: string[]): void {
    // get a list of IDs and return a list of player and update it
    const idWhitelistToPlayerWhitelist: Player[] = [];

    newWhitelist.forEach(playerID => {
      const player = this.playerFromID(playerID);

      if (player !== undefined) {
        idWhitelistToPlayerWhitelist.push(player);
      }
    });

    this._whitelist = idWhitelistToPlayerWhitelist;
  }


  /**
   * Publicize the space (reset everything to how a public space would be)
   */
  publicizeSpace(): void {
    this._isPrivate = false;
    this._presenterID = null;
    this._spaceHostID = null;
    this._whitelist = [];
  }

  /**
   * Remove all players from space
   */
  disconnectAllPlayersExceptP(p: string): void {
    const player = this.playerFromID(p);
    if (player !== undefined){
      this._players = [player];
    }
  }
}
