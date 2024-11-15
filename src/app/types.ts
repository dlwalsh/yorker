export type HowOut =
    | 'absent injured'
    | 'bowled'
    | 'caught'
    | 'handling the ball'
    | 'hit wicket'
    | 'not out'
    | 'lbw'
    | 'obstructing the field'
    | 'retired hurt'
    | 'retired out'
    | 'run out'
    | 'stumped'
    | 'timed out';

export type Player = {
    id: string;
    name: string;
};
