export const idlFactory = ({ IDL }) => {
  const Person = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'percentage' : IDL.Float64,
    'avatar' : IDL.Text,
  });
  return IDL.Service({
    'batchUpdatePercentages' : IDL.Func(
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Float64))],
        [IDL.Bool],
        [],
      ),
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
  });
};
export const init = ({ IDL }) => { return []; };
