import Poll from '../models/Poll.js';

let studentMap = new Map();       // socket.id -> studentName
let studentSockets = new Map();   // studentName -> socket.id
let currentPoll = null;
let results = {};

const handleSocketConnection = (socket, io) => {
  console.log('🟢 New client connected:', socket.id);

  // IDENTIFY STUDENT NAME
  socket.on('identify', (name) => {
    studentMap.set(socket.id, name);
    studentSockets.set(name, socket.id);
    console.log(`👤 Student identified: ${name}`);

    // Optional: send updated student list to teacher
    const connectedStudents = Array.from(studentSockets.keys());
    io.emit('studentList', connectedStudents);
  });

  // TEACHER STARTS A POLL
  socket.on('newPoll', (pollData) => {
    currentPoll = pollData;
    results = {};
    console.log('📢 New poll started:', currentPoll.question);
    io.emit('pollStarted', currentPoll);
  });

  // STUDENT SUBMITS ANSWER
  socket.on('submitAnswer', ({ student, answer }) => {
    if (currentPoll && !results[student]) {
      results[student] = answer;
      console.log(`✅ ${student} answered: ${answer}`);
      io.emit('pollUpdate', results);

      // Optional: auto-end when all students vote
      if (Object.keys(results).length === currentPoll.expectedStudents) {
        endPoll(io);
      }
    }
  });

  // TEACHER ENDS POLL MANUALLY
  socket.on('endPoll', () => {
    endPoll(io);
  });

  // TEACHER KICKS STUDENT
  socket.on('kickStudent', (name) => {
    const socketId = studentSockets.get(name);
    if (socketId) {
      io.to(socketId).emit('kicked');
      console.log(`🛑 Kicked: ${name}`);
      studentMap.delete(socketId);
      studentSockets.delete(name);
    }
  });

  // HANDLE DISCONNECT
  socket.on('disconnect', () => {
    const name = studentMap.get(socket.id);
    if (name) {
      console.log(`🔌 Disconnected: ${name}`);
      studentMap.delete(socket.id);
      studentSockets.delete(name);
      io.emit('studentList', Array.from(studentSockets.keys()));
    }
  });
};

// HELPER TO END POLL
async function endPoll(io) {
  if (currentPoll) {
    const pollToSave = new Poll({
      question: currentPoll.question,
      options: currentPoll.options,
      expectedStudents: currentPoll.expectedStudents,
      results,
    });

    try {
      await pollToSave.save();
      console.log('💾 Poll saved to DB');
    } catch (err) {
      console.error('❌ Failed to save poll:', err.message);
    }

    io.emit('pollEnded', results);
    currentPoll = null;
    results = {};
  }
}

export default handleSocketConnection;
