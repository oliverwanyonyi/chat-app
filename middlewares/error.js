const notFound = (req,res,next) =>{
    const error = new Error(`Url ${req.originalUrl} not found`)
    res.status(404)
   
    return next(error)
}

const errorHandler = (err,req,res,next) =>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)
    err.message = err.message || "Something went wrong"
    res.json({
        success:false,
        message:err.message
    })
}

export {notFound,errorHandler}