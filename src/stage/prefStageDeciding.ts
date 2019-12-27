#!/usr/bin/env node
'use strict';

import { size } from 'lodash';
import PrefGame from '../prefGame';
import APrefStage from './prefStage';
import PrefPlayer from '../prefPlayer';
import { EPrefStage } from '../PrefGameEnums';

export type PrefEnginePlayerDecision = { username: string, decision: boolean }

export default class PrefStageDeciding extends APrefStage {
	private readonly _decisions: PrefEnginePlayerDecision[];

	constructor(engine: PrefGame) {
		super(engine, EPrefStage.DECIDING);
		this._decisions = [];
	}

	public decide(player: PrefPlayer, follows: boolean): PrefStageDeciding {
		this._decisions.push({ username: player.username, decision: follows });
		return this;
	}

	get decidingCompleted(): boolean {
		return size(this._decisions) === 2;
	}

}
