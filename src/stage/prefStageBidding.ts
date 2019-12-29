#!/usr/bin/env node
'use strict';

import PrefGame from '../prefGame';
import APrefStage from './prefStage';
import PrefPlayer from '../prefPlayer';
import { EPrefBid } from '../PrefGameEnums';
import { includes } from 'lodash';

export type PrefEnginePlayerBid = { username: string, bid: EPrefBid }

const _addInitialGameBids = (bids: EPrefBid[]): EPrefBid[] => {
	bids.push(EPrefBid.BID_GAME);
	bids.push(EPrefBid.BID_GAME_BETL);
	bids.push(EPrefBid.BID_GAME_SANS);
	bids.push(EPrefBid.BID_GAME_PREFERANS);
	return bids;
};

export default class PrefStageBidding extends APrefStage {
	private _bids: PrefEnginePlayerBid[];
	private _max: EPrefBid;
	private _last: EPrefBid;

	constructor(game: PrefGame) {
		super(game);

		this._bids = [];
		this._max = EPrefBid.NO_BID;
		this._last = EPrefBid.NO_BID;
	}

	public isBidding = (): boolean => true;

	public bid(player: PrefPlayer): PrefStageBidding {
		const { username, bid } = player;
		this._bids.push({ username, bid });
		if (this._max < bid) this._max = bid;
		this._last = bid;
		return this;
	}

	get isGameBid(): boolean {
		return this._max >= EPrefBid.BID_GAME;
	}

	get highestBidder(): PrefPlayer {
		const p1 = this._game.p1;
		const p2 = this._game.p2;
		const p3 = this._game.p3;
		return (p1.bid > p2.bid)
			? (p1.bid > p3.bid ? p1 : p3)
			: (p2.bid > p3.bid ? p2 : p3);
	}

	get biddingCompleted(): boolean {
		let cnt = 0;
		if (this._game.p1.outOfBidding) cnt++;
		if (this._game.p2.outOfBidding) cnt++;
		if (this._game.p3.outOfBidding) cnt++;
		return cnt >= 2;
	}

	get options(): EPrefBid[] {
		const myLastBid: EPrefBid = this._game.player.bid;

		let choices = [];
		if (this._last >= EPrefBid.BID_GAME_BETL) {
			choices.push(EPrefBid.BID_PASS);
			switch (this._last) {
				case EPrefBid.BID_GAME_BETL:
					choices.push(EPrefBid.BID_GAME_SANS);
					choices.push(EPrefBid.BID_GAME_PREFERANS);
					break;
				case EPrefBid.BID_GAME_SANS:
					choices.push(EPrefBid.BID_GAME_PREFERANS);
					break;
				default:
					break;
			}

		} else if (this._last >= EPrefBid.BID_GAME) {
			switch (this._last) {
				case EPrefBid.BID_GAME:
					if (myLastBid === EPrefBid.BID_GAME) { // Zatvoren krug, treba da kazem KOJA je moja
						choices.push(EPrefBid.BID_GAME_SPADE);
						choices.push(EPrefBid.BID_GAME_DIAMOND);
						choices.push(EPrefBid.BID_GAME_HEART);
						choices.push(EPrefBid.BID_GAME_CLUB);

					} else if (myLastBid === EPrefBid.NO_BID) { // Ja nisam rekao nista, ali je pre mene licit IGRA
						choices.push(EPrefBid.BID_PASS);
						choices = _addInitialGameBids(choices);

					} else {  // Licitirao sam nesto sto nije IGRA ali sad je neko rekao IGRA
						choices.push(EPrefBid.BID_PASS);
					}
					break;
				case EPrefBid.BID_GAME_SPADE:
					choices.push(EPrefBid.BID_GAME_DIAMOND);
					choices.push(EPrefBid.BID_GAME_HEART);
					choices.push(EPrefBid.BID_GAME_CLUB);
					break;
				case EPrefBid.BID_GAME_DIAMOND:
					choices.push(EPrefBid.BID_YOURS_IS_BETTER);
					choices.push(EPrefBid.BID_GAME_HEART);
					choices.push(EPrefBid.BID_GAME_CLUB);
					break;
				case EPrefBid.BID_GAME_HEART:
					choices.push(EPrefBid.BID_YOURS_IS_BETTER);
					choices.push(EPrefBid.BID_GAME_CLUB);
					break;
				case EPrefBid.BID_GAME_CLUB:
					choices.push(EPrefBid.BID_YOURS_IS_BETTER);
					break;
				default:
					choices.push(EPrefBid.BID_PASS);
					break;
			}

		} else {
			choices.push(EPrefBid.BID_PASS);
			switch (this._last) {
				case EPrefBid.NO_BID:
				case EPrefBid.BID_PASS:
					choices.push(EPrefBid.BID_SPADE);
					choices = _addInitialGameBids(choices);
					break;
				case EPrefBid.BID_SPADE:
					choices.push(EPrefBid.BID_DIAMOND);
					choices = _addInitialGameBids(choices);
					break;
				case EPrefBid.BID_DIAMOND:
					if (myLastBid === EPrefBid.BID_SPADE) choices.push(EPrefBid.BID_DIAMOND_MINE);
					else {
						choices.push(EPrefBid.BID_HEART);
						choices = _addInitialGameBids(choices);
					}
					break;
				case EPrefBid.BID_DIAMOND_MINE:
					choices.push(EPrefBid.BID_HEART);
					break;
				case EPrefBid.BID_HEART:
					choices.push(EPrefBid.BID_HEART_MINE);
					break;
				case EPrefBid.BID_HEART_MINE:
					choices.push(EPrefBid.BID_CLUB);
					break;
				case EPrefBid.BID_CLUB:
					choices.push(EPrefBid.BID_CLUB_MINE);
					break;
				case EPrefBid.BID_CLUB_MINE:
					choices.push(EPrefBid.BID_BETL);
					break;
				case EPrefBid.BID_BETL:
					choices.push(EPrefBid.BID_BETL_MINE);
					break;
				case EPrefBid.BID_BETL_MINE:
					choices.push(EPrefBid.BID_SANS);
					break;
				case EPrefBid.BID_SANS:
					choices.push(EPrefBid.BID_SANS_MINE);
					break;
				case EPrefBid.BID_SANS_MINE:
					choices.push(EPrefBid.BID_PREFERANS);
					break;
				case EPrefBid.BID_PREFERANS:
					choices.push(EPrefBid.BID_PREFERANS_MINE);
					break;
				case EPrefBid.BID_PREFERANS_MINE:
				default:
					break;
			}
		}

		return choices;
	}

}
