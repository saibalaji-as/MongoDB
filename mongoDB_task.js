// MongoDB database design for Zen Class Programme

// 1. Creating collections and inserting data

// Users collection
db.users.insertMany([
    { _id: 1, name: "Alice" },
    { _id: 2, name: "Bob" },
    { _id: 3, name: "Charlie" },
    { _id: 4, name: "Diana" }
]);

// Codekata collection
db.codekata.insertMany([
    { user_id: 1, problems_solved: 50 },
    { user_id: 2, problems_solved: 70 },
    { user_id: 3, problems_solved: 30 },
    { user_id: 4, problems_solved: 90 }
]);

// Attendance collection
db.attendance.insertMany([
    { user_id: 1, date: new Date("2020-10-16"), status: "present" },
    { user_id: 2, date: new Date("2020-10-16"), status: "absent" },
    { user_id: 3, date: new Date("2020-10-16"), status: "absent" },
    { user_id: 4, date: new Date("2020-10-16"), status: "present" }
]);

// Topics collection
db.topics.insertMany([
    { topic: "HTML", date: new Date("2020-10-10") },
    { topic: "CSS", date: new Date("2020-10-15") },
    { topic: "JavaScript", date: new Date("2020-10-20") }
]);

// Tasks collection
db.tasks.insertMany([
    { task: "HTML Task", date: new Date("2020-10-12"), submitted: true },
    { task: "CSS Task", date: new Date("2020-10-17"), submitted: false },
    { task: "JavaScript Task", date: new Date("2020-10-25"), submitted: true }
]);

// Company Drives collection
db.company_drives.insertMany([
    { company: "Google", date: new Date("2020-10-16"), students: [1, 2] },
    { company: "Amazon", date: new Date("2020-10-28"), students: [2, 3] },
    { company: "Microsoft", date: new Date("2020-11-01"), students: [3, 4] }
]);

// Mentors collection
db.mentors.insertMany([
    { mentor_name: "John", mentees: [1, 2, 3, 4] },
    { mentor_name: "Jane", mentees: [1, 2] }
]);

// 2. Queries

// a) Find all the topics and tasks which are thought in the month of October
db.topics.aggregate([
    { $match: { date: { $gte: new Date("2020-10-01"), $lte: new Date("2020-10-31") } } },
    { $project: { topic: 1, _id: 0 } }
]);

db.tasks.aggregate([
    { $match: { date: { $gte: new Date("2020-10-01"), $lte: new Date("2020-10-31") } } },
    { $project: { task: 1, _id: 0 } }
]);

// b) Find all the company drives which appeared between 15 Oct 2020 and 31 Oct 2020
db.company_drives.find({
    date: { $gte: new Date("2020-10-15"), $lte: new Date("2020-10-31") }
});

// c) Find all the company drives and students who are appeared for the placement
db.company_drives.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "students",
            foreignField: "_id",
            as: "students_info"
        }
    },
    { $project: { company: 1, students_info: 1, _id: 0 } }
]);

// d) Find the number of problems solved by the user in codekata
db.codekata.find({}, { user_id: 1, problems_solved: 1, _id: 0 });

// e) Find all the mentors with mentee's count more than 15
db.mentors.find({ $expr: { $gt: [{ $size: "$mentees" }, 15] } });

// f) Find the number of users who are absent and tasks not submitted between 15 Oct 2020 and 31 Oct 2020
db.attendance.aggregate([
    {
        $match: {
            date: { $gte: new Date("2020-10-15"), $lte: new Date("2020-10-31") },
            status: "absent"
        }
    },
    {
        $lookup: {
            from: "tasks",
            let: { user_id: "$user_id" },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $gte: ["$date", new Date("2020-10-15")] },
                                { $lte: ["$date", new Date("2020-10-31")] },
                                { $eq: ["$submitted", false] }
                            ]
                        }
                    }
                }
            ],
            as: "unsubmitted_tasks"
        }
    },
    { $match: { "unsubmitted_tasks.0": { $exists: true } } },
    { $count: "absent_and_unsubmitted" }
]);
