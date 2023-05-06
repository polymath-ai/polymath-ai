# Schemish

JSON Schema is amazing and precise. But LLM's got your back. It doesn't need you to write it all out precisely and mechanically. It can guess what you want with a lot less.

To communicate structure, we need **Schemish** -- a very lightweight way to describe the structure of a JSON object. Like JSON Schema, but much simpler.

Take this JSON schema for example:

```json
{
    "type": "object",
    "properties": {
        "context": {
            "type": "string",
            "description": "A few sentences describing the context in which the question was asked"
        },
        "subjects": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Name of an subject mentioned or implied in the question"
                },
                "assumption": {
                    "type": "string",
                    "description": "An assumption that you made when identifying this subject"
                },
                "critique": {
                    "type": "string",
                    "description": "How might this assumption be wrong?"
                },
                "question": {
                    "type": "string",
                    "description": "A question that could be asked to test the assumption"
                }
            }
        },
        "objects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name of an object mentioned or implied in the question"
                    },
                    "assumption": {
                        "type": "string",
                        "description": "An assumption that you made when discerning this object"
                    },
                    "critique": {
                        "type": "string",
                        "description": "How might this assumption be wrong?"
                    },
                    "question": {
                        "type": "string",
                        "description": "A question that could be asked to test the assumption"
                    }
                }
            }
        }
    }
}
```

Whew! Long. Now, let's express it in Schemish:

```json
{
  "context": "A few sentences describing the context in which the question was asked",
  "subjects": [
    {
      "name": "Name of an subject mentioned or implied in the question",
      "assumption": "An assumption that you made when identifying this subject",
      "critique": "How might this assumption be wrong?",
      "question": "A question that could be asked to test the assumption",
    }
  ],
  "objects": [
    {
      "name": "Name of an object mentioned or implied in the question",
      "assumption": "An assumption that you made when discerning this object",
      "critique": "How might this assumption be wrong?",
      "question": "A question that could be asked to test the assumption",
    }
  ],
}
```

Wow. That's fewer tokens, and it still communicates the same structure. It's also easier to read and write.

YAML Schemish is even more compact:

```yaml
---
context: "A few sentences describing the context in which the question was asked",
  subjects:
    - name: "Name of an subject mentioned or implied in the question"
      assumption: "An assumption that you made when identifying this subject"
      critique: "How might this assumption be wrong?"
      question": "A question that could be asked to test the assumption"
  objects: 
    - name: "Name of an object mentioned or implied in the question"
      assumption: "An assumption that you made when discerning this object"
      critique: "How might this assumption be wrong?"
      question": "A question that could be asked to test the assumption"
```

And it turns out, this is perfectly okay with an LLM. So, why waste tokens with JSON Schema, when Schemish is enough?
