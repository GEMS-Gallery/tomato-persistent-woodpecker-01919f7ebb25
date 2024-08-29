export const idlFactory = ({ IDL }) => {
  const Person = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'percentage' : IDL.Float64,
    'avatar' : IDL.Text,
  });
  return IDL.Service({
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
    'setBillAmount' : IDL.Func([IDL.Float64], [], []),
    'updatePersonPercentage' : IDL.Func([IDL.Nat, IDL.Float64], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
