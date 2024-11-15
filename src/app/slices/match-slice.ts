import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HowOut, Player } from '../types';

type PlayerId = Player['id'];

type Batter = {
    ballsFaced: number;
    bowler: PlayerId | undefined;
    fielders: PlayerId[];
    fours: number;
    howOut: HowOut;
    runs: number;
    sixes: number;
};

type Bowler = {
    balls: number;
    maidens: number;
    noBalls: number;
    runs: number;
    wides: number;
};

type FallOfWicket = {
    batter: PlayerId;
    over: string;
    score: number;
    wicket: number;
};

type Inning = {
    batterOffStrike: PlayerId | undefined;
    batterOnStrike: PlayerId | undefined;
    batters: Record<PlayerId, Batter>;
    battingOrder: PlayerId[];
    bowlerCurrent: PlayerId | undefined;
    bowlerPrevious: PlayerId | undefined;
    bowlers: Record<PlayerId, Bowler>;
    bowlingOrder: PlayerId[];
    byes: number;
    fallOfWickets: FallOfWicket[];
    legByes: number;
    maxOvers: number | undefined;
    noBalls: number;
    penalties: number;
    wides: number;
};

type Match = {
    activeInning: 0 | 1 | 2 | 3;
    ballsPerOver: number;
    followOn: boolean;
    innings: Inning[];
    inningsPerSide: number;
    noBallsAsBallsFaced: true;
    playersPerSide: number;
    team1Name: string;
    team1Players: Record<PlayerId, Player>;
    team2Name: string;
    team2Players: Record<PlayerId, Player>;
    widesAsBallsFaced: boolean;
};

const initialState = {
    activeInning: 0,
    ballsPerOver: 6,
    followOn: false,
    innings: [],
    inningsPerSide: 2,
    noBallsAsBallsFaced: true,
    playersPerSide: 11,
    team1Name: '',
    team1Players: {},
    team2Name: '',
    team2Players: {},
    widesAsBallsFaced: false,
} satisfies Match;

const { actions, reducer } = createSlice({
    name: 'match',
    initialState: initialState as Match,
    reducers: {
        delivery(
            state,
            action: PayloadAction<{
                ballType: 'legal' | 'noBall' | 'wide';
                boundary: boolean;
                runType: 'bat' | 'byes' | 'legByes';
                runs: number;
            }>,
        ) {
            const {
                activeInning,
                innings,
                noBallsAsBallsFaced,
                widesAsBallsFaced,
            } = state;
            const {
                batters,
                batterOnStrike,
                batterOffStrike,
                bowlers,
                bowlerCurrent,
            } = innings[activeInning];
            const { ballType, boundary, runType, runs } = action.payload;

            const batter = batters[batterOnStrike as PlayerId];
            const bowler = bowlers[bowlerCurrent as PlayerId];

            if (runType === 'bat') {
                batter.runs += runs;

                if (boundary && runs === 4) {
                    batter.fours += 1;
                } else if (boundary && runs === 6) {
                    batter.sixes += 1;
                }
            }

            if (
                ballType === 'legal' ||
                (noBallsAsBallsFaced && ballType === 'noBall') ||
                (widesAsBallsFaced && ballType === 'wide')
            ) {
                batter.ballsFaced += 1;
            }

            if (runs % 2 === 1) {
                innings[activeInning].batterOnStrike = batterOffStrike;
                innings[activeInning].batterOffStrike = batterOnStrike;
            }

            if (ballType === 'legal') {
                bowler.balls += 1;

                if (runType === 'bat') {
                    bowler.runs += runs;
                }
            } else if (ballType === 'noBall') {
                bowler.noBalls += 1;
                bowler.runs += runs + 1;
            } else if (ballType === 'wide') {
                bowler.wides += 1;
                bowler.runs += runs + 1;
            }

            if (ballType === 'legal' && runType === 'byes') {
                innings[activeInning].byes += runs;
            } else if (ballType === 'legal' && runType === 'legByes') {
                innings[activeInning].legByes += runs;
            } else if (ballType === 'noBall') {
                innings[activeInning].noBalls +=
                    runType === 'bat' ? 1 : runs + 1;
            } else if (ballType === 'wide') {
                innings[activeInning].wides += runs + 1;
            }
        },
        over(state) {
            const { activeInning, innings } = state;
            const {
                batterOnStrike,
                batterOffStrike,
                bowlerCurrent,
                bowlerPrevious,
            } = innings[activeInning];

            innings[activeInning].batterOnStrike = batterOffStrike;
            innings[activeInning].batterOffStrike = batterOnStrike;
            innings[activeInning].bowlerCurrent = bowlerPrevious;
            innings[activeInning].bowlerPrevious = bowlerCurrent;
        },
        setActiveInning(
            state,
            action: PayloadAction<{ value: Match['activeInning'] }>,
        ) {
            const { value } = action.payload;

            state.activeInning = value;
        },
        setFollowOn(state, action: PayloadAction<{ value: boolean }>) {
            const { value } = action.payload;

            state.followOn = value;
        },
        setTeam1Name(state, action: PayloadAction<{ value: string }>) {
            const { value } = action.payload;

            state.team1Name = value;
        },
        setTeam1Player(state, action: PayloadAction<{ player: Player }>) {
            const { player } = action.payload;

            state.team1Players[player.id] = player;
        },
        setTeam2Name(state, action: PayloadAction<{ value: string }>) {
            const { value } = action.payload;

            state.team2Name = value;
        },
        setTeam2Player(state, action: PayloadAction<{ player: Player }>) {
            const { player } = action.payload;

            state.team2Players[player.id] = player;
        },
        swapStrike(state) {
            const { activeInning, innings } = state;
            const { batterOnStrike, batterOffStrike } = innings[activeInning];

            innings[activeInning].batterOnStrike = batterOffStrike;
            innings[activeInning].batterOffStrike = batterOnStrike;
        },
    },
});

export { actions as matchActions, reducer as matchReducer };
