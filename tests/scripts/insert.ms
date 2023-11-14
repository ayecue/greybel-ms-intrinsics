s = "Hello Bob!"
print s.insert(5, " there,")
print s.insert(-2, "?")
l = [1,2,3,4,5]
l.insert(1, "A")
l.insert(-2, "B")  // (second from the end)
print l		// should be: [1, "A", 2, 3, 4, "B", 5]
l = [1,2,3,4,5]
l.insert(0, "C")
l.insert(-1, "D")	// equivalent to l.push "B"
print l		// should be: ["C", 1, 2, 3, 4, 5, "D"]