A sort of a bus.

Bus contains messages.

Each message is:

```json
{
  "id": "Number. Required. Unique message id",
  "from": "Required. action type of the message originator",
  "type": "type of the action to take",
  "payload": "payload for the action",
  "dependencies": [ 
    "Optional. Array of message ids that must be processed before this one"
  ]
}
```

LLMs can send messages to the bus: one or more.

Bus has a dispatcher -- an actor that takes a message from a bus and directs it to appropriate handler.

Dispatcher handles all dependencies, ensuring that messages are processed in the right order.

There are a number of registered handlers, one for each message type.

Handlers are actor that take a message and do something with it.

Program exits when there are no more messages in the bus.

User is represented by a "User" actor, which can send messages to the bus or be given messages by the dispatcher.