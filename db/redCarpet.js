const ObjectId = require('mongodb').ObjectId;

module.exports = (db) => ({

    addCategory: ({name}) => {
        console.log('A');
        return db.collection('categories').insertOne({name});
    },

    addNominees: (categoryId, nominees) => {
        return db.collection('nominees').insertMany(nominees.map(n => ({...n, categoryId: ObjectId(categoryId)})));
    },

    addVotes: (votes, userId) => {
        const filter = votes.map(v => {
            return {
                _id: ObjectId(v.nomineeId),
                categoryId: ObjectId(v.categoryId)
            }
        });
        db.collection('users').updateOne({_id: ObjectId(userId)}, {$set: {voted: true}});
        return db.collection('nominees').updateOne(
            {$or: filter},
            {$inc: {votes: 1}}
        );
    },

    getVotes: (categoryId) => {
        return db.collection('nominees')
            .find({categoryId})
            .toArray();
    },

    getAllVotes: () => {
        return db.collection('votes')
            .aggregate([
                {$group: {_id: '$categoryId', nominees: {$push: '$$ROOT'}}}
            ])
            .toArray();
    }

});