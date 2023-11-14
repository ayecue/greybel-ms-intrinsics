sortedStr = function(d)
	result = "{"
	for k in d.indexes.sort
		result = result + k + ": " + d[k] + ", "
	end for
	return result[:-2] + "}"
end function
d = {}
d.push(1)
d.push(2)
d.push(3)
print sortedStr(d)
results = [d.pop, d.pop, d.pop]
results.sort
print results
print d