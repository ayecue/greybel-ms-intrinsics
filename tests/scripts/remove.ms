d = {}
d[null] = 42
print d
print d[null]
maybeNull = d.indexes[0]
print maybeNull == null
d.remove null
d[42] = null
print d
print d[42]
print d[42] == null
d = {null:42}
for kv in d
	print kv.key == null
end for
s = "Hello Bob!"
print s.remove("ell")
print remove(s, " Bob")
l = [1,2,3,4,5]
l.remove(-2)  // (second from the end)
print l
d = {1:"one", "foo":"bar"}
print d.remove("no such key")
print d.remove(1)
print d
list.zap = function(x)
	for i in range(self.len-1, 0)
		if self[i] == x then self.remove i
	end for
end function
l = ["a","b","c","b","a"]
l.zap("b")
print l