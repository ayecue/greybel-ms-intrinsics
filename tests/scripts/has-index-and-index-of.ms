s = "abcde"
print s.hasIndex(4)		// 1 (true)
print(s.hasIndex(5))	// 0
print s.hasIndex(-5)	// 1 (5 elements from the end)
print(s.hasIndex(-6))	// 0
print(s.indexOf("cd"))	// 2
print(s.indexOf("xy"))	// null
l = [2,4,6,8]
print l.hasIndex(3)		// 1 (true)
print l.hasIndex(4)		// 0
print l.hasIndex(-4)	// 1
print l.hasIndex("X")	// 0 {GitHub #3}
print l.indexOf(6) 		// 2
print l.indexOf(5) 		// null
d = {1:"one", 2:"two", "foo":42}
print d.hasIndex(1)		// 1 (true)
print(d.hasIndex("x"))	// 0
print(d.indexOf("two"))	// 2
print(d.indexOf(42))	// foo
print(d.indexOf(999))	// null
// and now with the optional "after" parameter...
s = "hello world"
print(s.indexOf("h",-1))	// 0
print(s.indexOf("o"))		// 4
print(s.indexOf("o",4))		// 7
print(s.indexOf("o",7))		// null
print(s.indexOf("l",-3))	// 9
l = [2,4,6,4,2]
print(l.indexOf(2,-1))		// 0
print(l.indexOf(2,0))		// 4
print l.indexOf("X",0)		// null {GitHub #3}
print(l.indexOf(2,-2))		// 4
print(l.indexOf(2,4))		// null
d["bar"] = 42
a = d.indexOf(42)			// "foo" (or "bar"; order undefined)
b = d.indexOf(42, a)		// "bar" (or "foo")
print(d.indexOf(42, b))		// null
l = [a,b]
l.sort
print(l)