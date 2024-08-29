export const idlFactory = ({ IDL }) => {
  const Person = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'percentage' : IDL.Float64,
    'avatar' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'addPerson' : IDL.Func([IDL.Text], [IDL.Nat], []),
    'batchUpdatePeople' : IDL.Func(
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Text, IDL.Float64, IDL.Opt(IDL.Text)))],
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
    'removePerson' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'setBillAmount' : IDL.Func([IDL.Float64], [], []),
    'updatePerson' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Float64, IDL.Opt(IDL.Text)],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
