import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => { 
    console.log('in signout');
    req.session = null;
    // res.clearCookie('express:sess')
    res.send({});
});

export {router as signoutRouter}