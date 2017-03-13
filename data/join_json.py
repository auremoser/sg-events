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

	print("Write the new json file")

	with open("merged_files.json", "wb") as outfile:
		json.dump(concatenated, outfile)



if __name__ == "__main__":
	concatenateJson()
