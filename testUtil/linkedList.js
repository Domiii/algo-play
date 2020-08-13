// function ListNode(x) {
//   this.value = x;
//   this.next = null;
// }

/**
 * Takes an array and returns the head of a linked list containing that array.
 */
module.exports = function linkedList(a) {
  if (!a || !a.length) {
    return null;
  }

  // NOTE: we don't want to use the ListNode constructor, because it makes serialization a lot more annoying
  const head = {
    value: a[0]
  };
  let current = head;
  for (const value of a.slice(1)) {
    current = current.next = {
      value
    };
  }
  return head;
}