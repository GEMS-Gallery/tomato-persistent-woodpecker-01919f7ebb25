import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Float "mo:base/Float";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";

actor {
  type Person = {
    id: Nat;
    name: Text;
    percentage: Float;
  };

  stable var billAmount: ?Float = null;
  stable var peopleEntries: [(Nat, Person)] = [];
  var people = HashMap.HashMap<Nat, Person>(10, Nat.equal, Nat.hash);
  var nextId: Nat = 0;

  public func setBillAmount(amount: Float): async () {
    billAmount := ?amount;
  };

  public func addPerson(name: Text): async Nat {
    let id = nextId;
    let newPerson: Person = {
      id = id;
      name = name;
      percentage = 0;
    };
    people.put(id, newPerson);
    nextId += 1;
    id
  };

  public func updatePerson(id: Nat, name: Text, percentage: Float): async Bool {
    switch (people.get(id)) {
      case (null) { false };
      case (?person) {
        let updatedPerson: Person = {
          id = person.id;
          name = name;
          percentage = percentage;
        };
        people.put(id, updatedPerson);
        true
      };
    }
  };

  public func removePerson(id: Nat): async Bool {
    switch (people.remove(id)) {
      case (null) { false };
      case (?_) { true };
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

  public func batchUpdatePeople(updates: [(Nat, Text, Float)]): async Bool {
    for ((id, name, percentage) in updates.vals()) {
      ignore await updatePerson(id, name, percentage);
    };
    true
  };

  system func preupgrade() {
    peopleEntries := Iter.toArray(people.entries());
  };

  system func postupgrade() {
    people := HashMap.fromIter<Nat, Person>(peopleEntries.vals(), 10, Nat.equal, Nat.hash);
    if (peopleEntries.size() > 0) {
      nextId := peopleEntries[peopleEntries.size() - 1].0 + 1;
    };
  };
}
