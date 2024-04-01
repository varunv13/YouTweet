import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens !");
    }
}

const registerUser = asyncHandler( async (req, res) => {

    // get user details from frontend
    const {fullName, email, username, password} = req.body;

    // validation of the details
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(existedUser) throw new ApiError(409, "User with email or username already exist");

    // check for images, check for avatars
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) throw new ApiError(400, "Avatar file is required!!");

    // upload them to cloudinary, and check again
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) throw new ApiError(400, "Avatar file is required!!!");

    // create user object, then create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // check for user creation
    if(!createdUser) throw new ApiError(500, "Something went wrong while user's registration");

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registerd successfully")
    );

} );

const loginUser = asyncHandler( async (req, res) => {
    // get email/username and password from the user
    const {email, username, password} = req.body;

    if(!username || !email) throw new ApiError(400, "username or password is required!");

    // validation of the details through username or email
    const user = await User.findOne({
        $or: [{username}, {email}]
    });

    // check wheather the user exists in the db or not
    if(!user) throw new ApiError(400, "User does not exist!");

    // if user present then check for the password if it's right or nor
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) throw new ApiError(401, "Password Incorrect!!");

    // generate access and refresh tokens
    const {accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = User.findById(user._id).select("-password -refreshToken");

    // return them to the user in cookies format and return response
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
});

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse (200, {}, "User logges out"));
});

export { registerUser, loginUser, logoutUser };