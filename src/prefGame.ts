#!/usr/bin/env node
'use strict';

import * as _ from 'lodash';

import PrefDeck, { PrefDeckCard } from 'preferans-deck-js';
import PrefScore, { PrefScoreMain, PrefScoreFollower } from 'preferans-score-js';
import { EPrefBid, EPrefContract, EPrefKontra, EPrefPlayerDealRole } from './prefEngineEnums';

import PrefRound from './round/prefRound';
import PrefPlayer from './prefPlayer';
import { PrefDesignation, PrefEvent, PrefGameOptions } from './prefEngineTypes';
import APrefObservable from './aPrefObservable';
import { Subscription } from 'rxjs';

const _random = (p1: PrefPlayer, p2: PrefPlayer, p3: PrefPlayer): PrefPlayer => {
	const r: number = _.random(1, 3);
	return r === 1 ? p1 : r === 2 ? p2 : p3;
};

const _checkPlayer = (game: PrefGame, username: string): void => {
	if (username !== game.player.username) throw new Error('PrefGame::checkCurrentPlayer:Wrong player: ' + username);
};

// TODO... export whats needed:
export { PrefPlayer, PrefDeck, PrefScore, PrefGameOptions };

export default class PrefGame extends APrefObservable {

	private readonly _bula: number;
	private readonly _refas: number;
	private readonly _options: PrefGameOptions;

	private readonly _p1: PrefPlayer;
	private readonly _p2: PrefPlayer;
	private readonly _p3: PrefPlayer;

	private _dealerPlayer!: PrefPlayer;
	private _firstPlayer!: PrefPlayer;
	private _secondPlayer!: PrefPlayer;

	private _player!: PrefPlayer;

	private readonly _deck: PrefDeck;
	private _score: PrefScore;
	private _round!: PrefRound;
	private readonly _rounds: PrefRound[];

	private _roundObserver!: Subscription;

	constructor(username1: string, username2: string, username3: string, bula: number, refas: number, options: PrefGameOptions) {
		super();

		this._p1 = new PrefPlayer('p1', username1);
		this._p2 = new PrefPlayer('p2', username2);
		this._p3 = new PrefPlayer('p3', username3);

		this._p1.nextPlayer = this._p2;
		this._p2.nextPlayer = this._p3;
		this._p3.nextPlayer = this._p1;

		this._bula = bula;
		this._refas = refas;
		this._options = options;

		this._rounds = [];
		this._deck = new PrefDeck();
		this._score = new PrefScore(this._p1.username, this._p2.username, this._p3.username, this._bula, this._refas);

		this.deal();
	}

	public restoreDeck(cards: PrefDeckCard[]): PrefGame {
		this._deck.restore(cards);
		return this;
	}

	public deal(): PrefGame {
		if (!this._dealerPlayer) this._dealerPlayer = _random(this._p1, this._p2, this._p3);
		else this._dealerPlayer = this._dealerPlayer.nextPlayer;
		this._firstPlayer = this._dealerPlayer.nextPlayer;
		this._secondPlayer = this._firstPlayer.nextPlayer;

		this._dealerPlayer.dealRole = EPrefPlayerDealRole.DEALER;
		this._firstPlayer.dealRole = EPrefPlayerDealRole.FIRST_BIDDER;
		this._secondPlayer.dealRole = EPrefPlayerDealRole.SECOND_BIDDER;

		let id = 1;
		if (this._round) id = this._round.id + 1;

		this._player = this._firstPlayer;
		this._round = new PrefRound(this, id);
		this._roundObserver = this._round.subscribe(this._roundObserverNext);
		return this;
	}

	public playerBids(username: string, bid: EPrefBid): PrefGame {
		_checkPlayer(this, username);
		if (!this._round.stage.isBiddingStage()) throw new Error('PrefGame::checkCurrentStage:Wrong stage: ' + this._round.stage);

		this._round.playerBids(this._player.designation, bid);
		return this;
	}

	public playerDiscarded(username: string, discard1: PrefDeckCard, discard2: PrefDeckCard): PrefGame {
		_checkPlayer(this, username);
		if (!this._round.stage.isDiscardingStage()) throw new Error('PrefGame::checkCurrentStage:Wrong stage: ' + this._round.stage);

		this._round.playerDiscarded(this._player.designation, discard1, discard2);
		return this;
	}

	public playerContracted(username: string, contract: EPrefContract): PrefGame {
		_checkPlayer(this, username);
		if (!this._round.stage.isContractingStage()) throw new Error('PrefGame::checkCurrentStage:Wrong stage: ' + this._round.stage);

		this._round.playerContracted(this._player.designation, contract);
		return this;
	}

	public playerDecided(username: string, follows: boolean): PrefGame {
		_checkPlayer(this, username);
		if (!this._round.stage.isDecidingStage()) throw new Error('PrefGame::checkCurrentStage:Wrong stage: ' + this._round.stage);

		this._round.playerDecided(this._player.designation, follows);
		return this;
	}

	public playerKontred(username: string, kontra: EPrefKontra): PrefGame {
		_checkPlayer(this, username);
		if (!this._round.stage.isKontringStage()) throw new Error('PrefGame::checkCurrentStage:Wrong stage: ' + this._round.stage);

		this._round.playerKontred(this._player.designation, kontra);
		return this;
	}

	public playerThrows(username: string, card: PrefDeckCard): PrefGame {
		_checkPlayer(this, username);
		if (!this._round.stage.isPlayingStage()) throw new Error('PrefGame::checkCurrentStage:Wrong stage: ' + this._round.stage);

		this._round.playerThrows(this._player.designation, card);
		return this;
	}

	public endRound(): PrefGame {
		// TODO: is new refa?
		// const hand = new PrefScoreHandGame...

		const mainPlayer = this.round.mainPlayer;
		const leftFollower = this.round.leftFollower;
		const rightFollower = this.round.rightFollower;

		const main: PrefScoreMain = { designation: mainPlayer.designation, tricks: 6, failed: false };
		const right: PrefScoreFollower = {
			designation: leftFollower.designation,
			tricks: this.round.leftFollowerTricks,
			failed: false,
			followed: leftFollower.follows,
		};
		const left: PrefScoreFollower = {
			designation: rightFollower.designation,
			tricks: this.round.rightFollowerTricks,
			failed: false,
			followed: rightFollower.follows,
		};

		this._score.addPlayedHand(this._round.value, main, left, right);

		return this;
	}

	public nextPlayer(): PrefGame {
		this._player = this._player.nextPlayer;
		this._round.setPlayerByDesignation(this._player.designation);
		return this;
	}

	public nextBiddingPlayer(): PrefGame {
		this.nextPlayer();
		if (this._player.outOfBidding) this.nextPlayer();
		this._round.setPlayerByDesignation(this._player.designation);
		return this;
	}

	public nextDecidingPlayer(): PrefGame {
		this.nextPlayer();
		if (this._player.isMain) this.nextPlayer();
		this._round.setPlayerByDesignation(this._player.designation);
		return this;
	}

	// TODO: check this
	public nextKontringPlayer(kontra: EPrefKontra): PrefGame {
		this.nextPlayer();
		if (this._player.isOutOfKontring(kontra)) this.nextPlayer();
		this._round.setPlayerByDesignation(this._player.designation);
		return this;
	}

	public nextPlayingPlayer(): PrefGame {
		this.nextPlayer();
		if (!this._player.isPlaying) this.nextPlayer();
		this._round.setPlayerByDesignation(this._player.designation);
		return this;
	}

	private _getPlayerByDesignation(designation: PrefDesignation): PrefPlayer {
		if ('p1' === designation) return this._p1;
		else if ('p2' === designation) return this._p2;
		else return this._p3;
	}

	// TODO: split this up?
	private _roundObserverNext(value: PrefEvent): void {
		console.log('roundObserverNext', value);

		const { source, event, data } = value;
		// if ('round' !== source) throw new Error('PrefGame::roundObserver:Source is not "round" but is ' + source + '?');

		if ('nextBiddingPlayer' === event) this.nextBiddingPlayer();
		else if ('nextDecidingPlayer' === event) this.nextDecidingPlayer();
		else if ('nextKontringPlayer' === event) this.nextKontringPlayer(data);
		else if ('nextPlayingPlayer' === event) this.nextPlayingPlayer();
		else if ('activePlayer' === event) {
			this._round.setPlayerByDesignation(data);
			this._player = this._getPlayerByDesignation(data);
		}

		// TODO: broadcast full game state
	}

	get deck(): PrefDeck {
		return this._deck;
	}

	get round(): PrefRound {
		return this._round;
	}

	get firstPlayer(): PrefPlayer {
		return this._firstPlayer;
	}

	get secondPlayer(): PrefPlayer {
		return this._secondPlayer;
	}

	get dealerPlayer(): PrefPlayer {
		return this._dealerPlayer;
	}

	set player(player: PrefPlayer) {
		this._player = player;
	}

	get player(): PrefPlayer {
		return this._player;
	}

	get p1(): PrefPlayer {
		return this._p1;
	}

	get p2(): PrefPlayer {
		return this._p2;
	}

	get p3(): PrefPlayer {
		return this._p3;
	}

	get json(): any {
		return this._rounds;
	}

}
