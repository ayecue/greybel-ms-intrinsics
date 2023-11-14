lst = [5, 12, 3, 45, 9]  // sorts numerically
print lst.sort
print lst.sort(null, false)
lst = [5, "3", 42]  // sorts alphabetically
print lst.sort
print lst.sort(null, false)
lst = [2, null, 1]
print lst.sort
lst = ["b", null, "a"]
print lst.sort
lst = [{"name":"one", "val":1}, {"name":"two", "val":2}, {"name":"three", "val":3}]
print lst.sort("name")
print lst.sort("val")
print lst.sort("name", false)
print lst.sort("val", false)