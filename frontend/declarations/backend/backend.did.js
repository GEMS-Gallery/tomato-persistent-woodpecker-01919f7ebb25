export const idlFactory = ({ IDL }) => {
  const Person = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'percentage' : IDL.Float64,
  });
  return IDL.Service({
    'addPerson' : IDL.Func([IDL.Text], [IDL.Nat], []),
    'getBillDetails' : IDL.Func(
        [],
        [
          IDL.Record({
            'people' : IDL.Vec(Person),
            'totalPercentage' : IDL.Float64,
            'billAmount' : IDL.Opt(IDL.Float64),
          }),
        ],
        ['query'],
      ),
    'removePerson' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'setBillAmount' : IDL.Func([IDL.Float64], [], []),
    'updatePercentage' : IDL.Func([IDL.Nat, IDL.Float64], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
