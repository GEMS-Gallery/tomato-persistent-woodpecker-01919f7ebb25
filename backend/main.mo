import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Float "mo:base/Float";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Option "mo:base/Option";

actor {
  type Person = {
    id: Nat;
    name: Text;
    percentage: Float;
    avatar: Text;
  };

  stable var billAmount: ?Float = null;
  stable var peopleEntries: [(Nat, Person)] = [];
  var people = HashMap.HashMap<Nat, Person>(10, Nat.equal, Nat.hash);

  public func setBillAmount(amount: Float): async () {
    billAmount := ?amount;
  };

  public func updatePersonPercentage(id: Nat, percentage: Float): async Bool {
    switch (people.get(id)) {
      case (null) { false };
      case (?person) {
        let updatedPerson: Person = {
          id = person.id;
          name = person.name;
          percentage = percentage;
          avatar = person.avatar;
        };
        people.put(id, updatedPerson);
        true
      };
    }
  };

  public query func getBillDetails(): async {
    billAmount: ?Float;
    people: [Person];
    totalPercentage: Float;
  } {
    let peopleArray = Iter.toArray(people.vals());
    let totalPercentage = Array.foldLeft<Person, Float>(peopleArray, 0, func (acc, p) { acc + p.percentage });
    {
      billAmount = billAmount;
      people = peopleArray;
      totalPercentage = totalPercentage;
    }
  };

  private func initializeDefaultPeople() {
    let defaultPeople = [
      (0, "Kyle", "https://pbs.twimg.com/profile_images/1797677925761978368/UByoyGsH_400x400.jpg"),
      (1, "Josh", "https://media.licdn.com/dms/image/v2/C5603AQGthJL_DcMSIA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1518390992422?e=1730332800&v=beta&t=FwHENS15u_vMr1BrmzIrzyw_-pJot2UyLMC7FchSILo"),
      (2, "Samuel", "https://media.licdn.com/dms/image/v2/C4D03AQEWyMuV3rjZ-Q/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1593372307660?e=1730332800&v=beta&t=8-2_YMJK_oB6JVj1TxlgS60Y_5OpTpGCKHr9mdiVEv8"),
      (3, "Jeff", "https://media.licdn.com/dms/image/v2/C4D03AQEEFGgOHeQT1g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1631805692690?e=1730332800&v=beta&t=DCDOHbxb2gveaupqYxb7otUd7au3NnCLoINHn7kQjyI")
    ];

    for ((id, name, avatar) in defaultPeople.vals()) {
      let newPerson: Person = {
        id = id;
        name = name;
        percentage = 0;
        avatar = avatar;
      };
      people.put(id, newPerson);
    };
  };

  system func preupgrade() {
    peopleEntries := Iter.toArray(people.entries());
  };

  system func postupgrade() {
    people := HashMap.fromIter<Nat, Person>(peopleEntries.vals(), 10, Nat.equal, Nat.hash);
    if (peopleEntries.size() == 0) {
      initializeDefaultPeople();
    };
  };
}
