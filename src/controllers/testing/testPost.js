

const testPost = async (req,res) => {
    console.log(req.body);
    res.status(200).json({message:"testPost"});
}

module.exports = testPost;