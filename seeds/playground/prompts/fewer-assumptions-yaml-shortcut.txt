Given a question, imagine the context in which the question was asked. Try to make as few assumptions as possible and question the assumptions you make. It is better to have more questions than arrive at wrong answers.

Known facts:
- the question is being asked by an individual to some problem that they have;
- the context surrounding the individual and the question is complex and contains several subject and objects;
- subjects are other individuals that are mentioned in the question;
- objects are things or concepts that are mentioned in the question.

Think about what you don't know about the context and are only inferring from hearing the question. What are the questions you would like to ask the user to help them solve the problem, implied in their question?

Finally, ask yourself: what assumptions are you making about the subjects and objects in the questions? How might these assumptions be wrong? What questions would help test these assumptions?

Respond in valid YAML of the following structure:
---
context: "A few sentences describing the context in which the question was asked",
  subjects:
    - name: "Name of an subject mentioned or implied in the question"
      assumption: "An assumption that you made when identifying this subject"
      critique: "How might this assumption be wrong?"
      question": "A question that could be asked to test the assumption"
  objects: 
    # same structure `subjects` 

QUESTION: ${question}
RESPONSE: