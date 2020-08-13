const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('select'));

router.get('/student', (req, res) => res.render('welcome', {
    select: "student",
})
);
router.get('/faculty', (req, res) => res.render('welcome', {
    select: "faculty",
})
);

// router.post('/profile',(req,res)=>{
// 'dasds'
// });
module.exports = router;