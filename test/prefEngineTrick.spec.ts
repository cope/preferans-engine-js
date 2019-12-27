import * as _ from 'lodash';
import { expect } from 'chai';

import PrefTrick from '../src/prefTrick';
import PrefDeckCard, { PrefDeckCardSuit, PrefDeckCardValue } from 'preferans-deck-js/lib/prefDeckCard';
import PrefPlayer from '../src/prefPlayer';

const cope = new PrefPlayer('cope');
const milja = new PrefPlayer('milja');
const mitko = new PrefPlayer('mitko');
const milan = new PrefPlayer('milan');

describe('PrefTrick tests', () => {
	it('PrefTrick should exist', () => {
		expect(PrefTrick).to.exist;
	});

	describe('Contructor tests', () => {
		it('Pure contructor should return empty positions', () => {
			expect(new PrefTrick(2).first).to.be.null;
			expect(new PrefTrick(2).second).to.be.null;
			expect(new PrefTrick(2).third).to.be.null;
			expect(new PrefTrick(2).trump).to.be.null;
			expect(() => new PrefTrick(2).winner).to.throw();
			expect(new PrefTrick(2).ppn).to.be.equal('');
			expect(new PrefTrick(2).string).to.be.equal('{"first":{},"second":{},"third":{},"trump":null,"winner":null}');
		});
	});

	describe('Bad trump contructor tests', () => {
		const fails = [1, 2, 3, 4, 5, 6, 11, 16, 'z', 'Z'];
		_.forEach(fails, (fail) => {
			it('contructor should fail for value=' + JSON.stringify(fail), () => {
				expect(new PrefTrick(2).trump).to.be.null;
			});
		});
	});

	describe('Good trump contructor tests', () => {
		const passes = [PrefDeckCardSuit.SPADE, PrefDeckCardSuit.DIAMOND, PrefDeckCardSuit.HEART, PrefDeckCardSuit.CLUB];
		_.forEach(passes, (pass) => {
			it('contructor should pass for value=' + JSON.stringify(pass), () => {
				expect(new PrefTrick(2, pass).trump).to.be.not.null;
			});
		});
	});

	describe('PrefTrick throw 1 card test', () => {
		const trick = new PrefTrick(2);
		trick.throw(cope, new PrefDeckCard(PrefDeckCardSuit.CLUB, PrefDeckCardValue.SEVEN));
		it('PrefTrick throw 1 card test', () => {
			expect(trick.first).to.be.not.null;
			expect(trick.second).to.be.null;
			expect(trick.third).to.be.null;
			expect(trick.trump).to.be.null;
			expect(() => trick.winner).to.throw();
			expect(trick.ppn).to.be.equal('P');
			expect(trick.string).to.be.equal('{"first":{"card":"7Club","username":"cope"},"second":{},"third":{},"trump":null,"winner":null}');
		});
	});

	describe('PrefTrick throw 2 cards test', () => {
		const trick = new PrefTrick(2);
		trick.throw(cope, new PrefDeckCard(PrefDeckCardSuit.CLUB, PrefDeckCardValue.SEVEN));
		trick.throw(milja, new PrefDeckCard(PrefDeckCardSuit.SPADE, PrefDeckCardValue.KING));
		it('PrefTrick throw 2 cards test', () => {
			expect(trick.first).to.be.not.null;
			expect(trick.second).to.be.not.null;
			expect(trick.third).to.be.null;
			expect(trick.trump).to.be.null;
			expect(() => trick.winner).to.throw();
			expect(trick.ppn).to.be.equal('P7');
			expect(trick.string).to.be.equal(
				'{"first":{"card":"7Club","username":"cope"},' +
				'"second":{"card":"KSpade","username":"milja"},' +
				'"third":{},' +
				'"trump":null,' +
				'"winner":{"player":{"_starter":"cope","_username":"cope","_replacements":[],"_cards":{"_cards":[],"_original":[]},"_dealRole":0,"_playRole":0,"_bid":-1,"_lastBid":-1,"_follows":false,"_kontra":0,"_lastKontra":0},"card":{"_suit":"Club","_value":7,"_rank":7,"_label":"7Club","_unicode":"7♣","_ppn":"P"}}}');
		});
	});

	describe('PrefTrick throw 3 cards test', () => {
		const trick = new PrefTrick(3);
		trick.throw(cope, new PrefDeckCard(PrefDeckCardSuit.CLUB, PrefDeckCardValue.SEVEN));
		trick.throw(milja, new PrefDeckCard(PrefDeckCardSuit.SPADE, PrefDeckCardValue.KING));
		trick.throw(mitko, new PrefDeckCard(PrefDeckCardSuit.DIAMOND, PrefDeckCardValue.QUEEN));
		it('PrefTrick throw 3 cards test', () => {
			expect(trick.first).to.be.not.null;
			expect(trick.second).to.be.not.null;
			expect(trick.third).to.be.not.null;
			expect(trick.trump).to.be.null;
			expect(() => trick.winner).to.throw();
			expect(trick.ppn).to.be.equal('P7E');
			expect(trick.string).to.be.equal(
				'{"first":{"card":"7Club","username":"cope"},' +
				'"second":{"card":"KSpade","username":"milja"},' +
				'"third":{"card":"QDiamond","username":"mitko"},' +
				'"trump":null,' +
				'"winner":{"player":{"_starter":"cope","_username":"cope","_replacements":[],"_cards":{"_cards":[],"_original":[]},"_dealRole":0,"_playRole":0,"_bid":-1,"_lastBid":-1,"_follows":false,"_kontra":0,"_lastKontra":0},"card":{"_suit":"Club","_value":7,"_rank":7,"_label":"7Club","_unicode":"7♣","_ppn":"P"}}}');
		});
	});

	describe('PrefTrick throw 4 cards test', () => {
		const trick = new PrefTrick(3);
		trick.throw(cope, new PrefDeckCard(PrefDeckCardSuit.CLUB, PrefDeckCardValue.SEVEN));
		trick.throw(milja, new PrefDeckCard(PrefDeckCardSuit.SPADE, PrefDeckCardValue.KING));
		trick.throw(mitko, new PrefDeckCard(PrefDeckCardSuit.DIAMOND, PrefDeckCardValue.QUEEN));
		it('PrefTrick throw 4 cards test', () => {
			expect(() => trick.throw(milan, new PrefDeckCard(PrefDeckCardSuit.SPADE, PrefDeckCardValue.SEVEN))).to.throw();
		});
	});

	describe('PrefTrick throw 1 card test with trump', () => {
		const trick = new PrefTrick(2, PrefDeckCardSuit.HEART);
		trick.throw(cope, new PrefDeckCard(PrefDeckCardSuit.CLUB, PrefDeckCardValue.SEVEN));
		it('PrefTrick throw 1 card test', () => {
			expect(trick.first).to.be.not.null;
			expect(trick.second).to.be.null;
			expect(trick.third).to.be.null;
			expect(trick.trump).to.be.equal('Heart');
			expect(() => trick.winner).to.throw();
			expect(trick.ppn).to.be.equal('P');
			expect(trick.string).to.be.equal('{"first":{"card":"7Club","username":"cope"},"second":{},"third":{},"trump":"Heart","winner":null}');
		});
	});

	describe('PrefTrick throw 2 cards test with trump', () => {
		const trick = new PrefTrick(2, PrefDeckCardSuit.HEART);
		trick.throw(cope, new PrefDeckCard(PrefDeckCardSuit.CLUB, PrefDeckCardValue.SEVEN));
		trick.throw(milja, new PrefDeckCard(PrefDeckCardSuit.SPADE, PrefDeckCardValue.KING));
		it('PrefTrick throw 2 cards test', () => {
			expect(trick.first).to.be.not.null;
			expect(trick.second).to.be.not.null;
			expect(trick.third).to.be.null;
			expect(trick.trump).to.be.equal('Heart');
			expect(() => trick.winner).to.throw();
			expect(trick.ppn).to.be.equal('P7');
			expect(trick.string).to.be.equal(
				'{"first":{"card":"7Club","username":"cope"},' +
				'"second":{"card":"KSpade","username":"milja"},' +
				'"third":{},' +
				'"trump":"Heart",' +
				'"winner":{"player":{"_starter":"cope","_username":"cope","_replacements":[],"_cards":{"_cards":[],"_original":[]},"_dealRole":0,"_playRole":0,"_bid":-1,"_lastBid":-1,"_follows":false,"_kontra":0,"_lastKontra":0},"card":{"_suit":"Club","_value":7,"_rank":7,"_label":"7Club","_unicode":"7♣","_ppn":"P"}}}');
		});
	});

	describe('PrefTrick throw 2 cards test with trump', () => {
		const trick = new PrefTrick(2, PrefDeckCardSuit.HEART);
		trick.throw(cope, new PrefDeckCard(PrefDeckCardSuit.CLUB, PrefDeckCardValue.SEVEN));
		trick.throw(milja, new PrefDeckCard(PrefDeckCardSuit.HEART, PrefDeckCardValue.SEVEN));
		it('PrefTrick throw 2 cards test', () => {
			expect(trick.first).to.be.not.null;
			expect(trick.second).to.be.not.null;
			expect(trick.third).to.be.null;
			expect(trick.trump).to.be.equal('Heart');
			expect(() => trick.winner).to.throw();
			expect(trick.ppn).to.be.equal('PH');
			expect(trick.string).to.be.equal(
				'{"first":{"card":"7Club","username":"cope"},' +
				'"second":{"card":"7Heart","username":"milja"},' +
				'"third":{},' +
				'"trump":"Heart",' +
				'"winner":{"player":{"_starter":"milja","_username":"milja","_replacements":[],"_cards":{"_cards":[],"_original":[]},"_dealRole":0,"_playRole":0,"_bid":-1,"_lastBid":-1,"_follows":false,"_kontra":0,"_lastKontra":0},"card":{"_suit":"Heart","_value":7,"_rank":7,"_label":"7Heart","_unicode":"7♥","_ppn":"H"}}}');
		});
	});

	describe('PrefTrick throw 3 cards test with trump', () => {
		const trick = new PrefTrick(3, PrefDeckCardSuit.HEART);
		trick.throw(cope, new PrefDeckCard(PrefDeckCardSuit.CLUB, PrefDeckCardValue.SEVEN));
		trick.throw(milja, new PrefDeckCard(PrefDeckCardSuit.HEART, PrefDeckCardValue.SEVEN));
		trick.throw(mitko, new PrefDeckCard(PrefDeckCardSuit.HEART, PrefDeckCardValue.QUEEN));
		it('PrefTrick throw 3 cards test', () => {
			expect(trick.first).to.be.not.null;
			expect(trick.second).to.be.not.null;
			expect(trick.third).to.be.not.null;
			expect(trick.trump).to.be.equal('Heart');
			expect(() => trick.winner).to.throw();
			expect(trick.ppn).to.be.equal('PHM');
			expect(trick.string).to.be.equal('' +
				'{"first":{"card":"7Club","username":"cope"},' +
				'"second":{"card":"7Heart","username":"milja"},' +
				'"third":{"card":"QHeart","username":"mitko"},' +
				'"trump":"Heart",' +
				'"winner":{"player":{"_starter":"mitko","_username":"mitko","_replacements":[],"_cards":{"_cards":[],"_original":[]},"_dealRole":0,"_playRole":0,"_bid":-1,"_lastBid":-1,"_follows":false,"_kontra":0,"_lastKontra":0},"card":{"_suit":"Heart","_value":13,"_rank":13,"_label":"QHeart","_unicode":"Q♥","_ppn":"M"}}}');
		});
	});

	describe('PrefTrick throw 4 cards test with trump', () => {
		const trick = new PrefTrick(3, PrefDeckCardSuit.HEART);
		trick.throw(cope, new PrefDeckCard(PrefDeckCardSuit.CLUB, PrefDeckCardValue.SEVEN));
		trick.throw(milja, new PrefDeckCard(PrefDeckCardSuit.HEART, PrefDeckCardValue.SEVEN));
		trick.throw(mitko, new PrefDeckCard(PrefDeckCardSuit.HEART, PrefDeckCardValue.QUEEN));
		it('PrefTrick throw 4 cards test', () => {
			expect(() => trick.throw(milan, new PrefDeckCard(PrefDeckCardSuit.SPADE, PrefDeckCardValue.SEVEN))).to.throw();
		});
	});

});
