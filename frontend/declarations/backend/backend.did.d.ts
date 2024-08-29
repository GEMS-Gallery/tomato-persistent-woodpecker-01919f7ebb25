import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Person {
  'id' : bigint,
  'name' : string,
  'percentage' : number,
  'avatar' : string,
}
export interface _SERVICE {
  'getBillDetails' : ActorMethod<
    [],
    {
      'people' : Array<Person>,
      'totalPercentage' : number,
      'billAmount' : [] | [number],
    }
  >,
  'setBillAmount' : ActorMethod<[number], undefined>,
  'updatePersonPercentage' : ActorMethod<[bigint, number], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
