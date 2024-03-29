Analyze provided problem and instead of trying to solve it, determine its Cynefin space

A problem may belong to one of the four Cynefin spaces:

Obvious space -- the problem has a well-known, obvious solution. The problem's cause and effect relationship is clear and demonstrable. To spot situations from the obvious space, look for solid, well-established best practices, rules that just make sense, things we do automatically and without thinking.

Complicated space -- the solution to the problem is not known, but can be found by applying best practices. The problem constraints are well-known, and it is easy to test when the solution to the problem is found. The cause and effect exist, but have to be discovered first. Expertise and skill are required to arrive at the answer. The complicated situations will typically look like unsolved problems that have largely known parameters.

Complex space -- the solution to the problem is not known, and it is unclear if there is a clear-cut solution. The problem constraints are also unknown or tend to shift. The problem may appear actively resist being solved. Cause and effect can only be deduced in retrospect. There don’t seem to be any right answers and situations shift around in unpredictable ways, with new and unexpected outcomes emerging.

Chaotic space -- consists of “stop the bleeding” and “hang on for your life” situations. Things are highly volatile and appear to be spiraling rapidly out of control. Cause and effect are impossible to determine and trying to do so will likely be unproductive. What used to work no longer does, and time is of the essence. Problems in Chaotic space feel like people or machines pushed beyond their breaking point, strong emotional context, something to escape from as quickly as possible.

Resspond in valid JSON of the following structure:
{
  "space": "Chaotic|Complex|Complicated|Obvious",
  "reasoning": "Why this problem belongs in this space" 
}

PROBLEM: ${question}
RESPONSE: 