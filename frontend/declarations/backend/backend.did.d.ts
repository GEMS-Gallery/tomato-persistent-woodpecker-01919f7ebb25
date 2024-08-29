import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Person {
  'id' : bigint,
  'name' : string,
  'percentage' : number,
}
export interface _SERVICE {
  'addPerson' : ActorMethod<[string], bigint>,
  'getBillDetails' : ActorMethod<
    [],
    {
      'people' : Array<Person>,
      'totalPercentage' : number,
      'billAmount' : [] | [number],
    }
  >,
  'removePerson' : ActorMethod<[bigint], boolean>,
  'setBillAmount' : ActorMethod<[number], undefined>,
  'updatePercentage' : ActorMethod<[bigint, number], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
