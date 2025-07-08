# import nltk
# nltk.download('stopwords')

from pyresparser import ResumeParser
import sys
import json

# Get the file path from Node.js
resume_path = sys.argv[1]

# Parse the resume
data = ResumeParser(resume_path).get_extracted_data()

# Output as JSON
print(json.dumps(data))