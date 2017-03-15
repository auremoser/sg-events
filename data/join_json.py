import os
import json
import glob


def getPathName():
	list_dir = []
	for path in os.listdir(os.getcwd()):
		if(path[-3] != "." or path[-5] != "."):
			list_dir.append(path)
	return list_dir



def concatenateJson():
	directorys = getPathName()
	concatenated = []
	for path in directorys:
		for f_json in glob.glob(path + '/*.json'):
			with open(f_json, "rb") as infile:
				concatenated.append(json.load(infile))

	return concatenated


def removeDefaultEvents(list_jsons):
	
	count = 0
	helper = [] 
	default_title = "Make Your First Event"

	for jsons in list_jsons:
		for key in jsons: 
			for values in key: 
				if(values == "title"):
					if(key[values] != default_title):
						helper.append(key)
					else: 
						count+=1
				break
			break

	print("Write the new json file")
	with open("merged_files.json", "wb") as outfile:
		json.dump(helper, outfile)

	print("Has %i default events" % count)



if __name__ == "__main__":
	
	removeDefaultEvents(concatenateJson())




