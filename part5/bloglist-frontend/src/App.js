import { useState, useEffect } from "react";
import Blog from "./components/Blog";
import {
  getBlogs,
  setToken,
  createBlog,
  deleteBlog,
} from "./services/blogServices";
import loginService from "./services/login";

const loginUrl = 'http://localhost:3001/api/login'
const blogsUrl = 'http://localhost:3001/api/blogs'

// const loginUrl = "https://4rjbcc-3001.preview.csb.app/api/login";
// const blogsUrl = "https://4rjbcc-3001.preview.csb.app/api/blogs";


const Notification = (props) => {
  return (
    <h3>A new blog made!</h3>
  )
}

const ErrorNotification = (props) => {
  return (
    <h3>Wrong username and password!</h3>
  )
}


const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [latestBlog, setLatestBlog] = useState("");
  const [added,setAdded] = useState(false)
  const [success,setSucess] = useState(null)


  useEffect(() => {
    getBlogs(blogsUrl).then((blogs) => setBlogs(blogs));
  }, []);

  useEffect(() => {

    //Returns the item that is stored as the key we used 
    const loggedInUser = localStorage.getItem('loggedInBlogUser')
    const userBlogs = localStorage.getItem('userBlogs')

    if (loggedInUser){

      //Parse here retrieves the DOM string that is saved to the browser and converts it to JavaScript Object 
      const retrievedUser = JSON.parse(loggedInUser)
      const retrievedUserBlogs = JSON.parse(userBlogs)
      console.log(retrievedUserBlogs)
      setUser(retrievedUser)
      setToken(retrievedUser.token)
      setUserBlogs(retrievedUserBlogs)
      setLatestBlog(retrievedUserBlogs.at(-1).id);
  
    }
    },[])
  
  

  const loginForm = () => (
    <>
      <h2>Log In to Your Application</h2>
      <form onSubmit={login}>
        <div>
          username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          password:
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Log in! </button>
      </form>
    </>
  );

  const blogForm = () => {
    return (
      <>
        <h2>Create a new blog ! </h2>
        <form onSubmit={addBlog}>
          <h3>
            title:
            <input
              type="text"
              value={title}
              placeholder="title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </h3>
          <h3>
            author:
            <input
              type="text"
              value={author}
              placeholder="author"
              onChange={(e) => setAuthor(e.target.value)}
            />
          </h3>
          <h3>
            url:
            <input
              type="text"
              value={url}
              placeholder="url"
              onChange={(e) => setUrl(e.target.value)}
            />
          </h3>
          <button type="submit"> Create a blog! </button>
        </form>
      </>
    );
  };

  const login = async (e) => {
    e.preventDefault();
    console.log("Log IN Button clicked");

    try {
      //In using POST, Axios automatically adds that object field into the body of the request object
      //In the response, this is based on what we defined in the server. So if the login is sucessful, I defined a response to consist of a json object that has the token, user, username, and userID
      //If we console.log(user), we should see all this stuff
      //Note in Axios, we can acess the response field using the .data parameter (shown in login.js)
      //The axios api defines .data as the response returned by the server
      const user = await loginService(loginUrl, { username, password });
      console.log(user);

      //Save the response from the server to the user state
      setUser(user);
      setToken(user.token);

      //Reset the fields
      setUsername("");
      setPassword("");

      //After the user successfully logsin, we want to set the current user's blogs equal to
      //a filtered list of blogs that belong to the user
      const filteredBlogs = blogs.filter(element => element.user === user.id);
      setUserBlogs(filteredBlogs);

      //Save the latest blog's id to this state. This is based on the user's current list of blogs
      setLatestBlog(filteredBlogs[filteredBlogs.length - 1].id);

      //Use localstorage to save the user's blog and info. Only strings can be saved to the browser
      //So we use JSON.stringify
      console.log(`User blogs ${userBlogs}`)

      window.localStorage.setItem("loggedInBlogUser", JSON.stringify(user));
      window.localStorage.setItem("userBlogs", JSON.stringify(filteredBlogs));

      //DO NOT do the code below! userBlogs is updated AFTER this block of code is complete.
      //The current value of userBlogs is still an [] array because after the user logs in,
      //the userBlogs state is an empty state and it gets rendered here 

      // window.localStorage.setItem("userBlogs", JSON.stringify(userBlogs));

    } catch (error) {
      console.log(error);
      console.log(error.response.data);
      console.log("ERROR");
      setUsername("");
      setPassword("");
      setSucess(true)
    }
  };

  const logout = () => {
    window.localStorage.clear()
    setUser(null)
  }

  const addBlog = async (e) => {
    e.preventDefault();
    console.log("Add button clicked");
    try {
      const response = await createBlog(blogsUrl, { title, author, url });
      console.log(`Front end`);
      console.log(response);
      setTitle("");
      setAuthor("");
      setUrl("");
      
      //Update the state for tte latest userBlogs by creating a new array of blogs 
      const updatedUserBlogs = [...userBlogs, response]
      setUserBlogs(updatedUserBlogs)
      setLatestBlog(response.id);
      
      //After adding a blog, we need to update the local storage so when we refresh, it saves
      window.localStorage.setItem("userBlogs", JSON.stringify(updatedUserBlogs)); 
      
      
      setAdded(true)

    } catch (error) {
      console.log(error);
      console.log(error.response.data);
      console.log("ERROR");
    }
  };


  const deleteLatest = async () => {
    if (latestBlog.length !== 0) {
      const response = await deleteBlog(blogsUrl + `/${latestBlog}`);
      console.log(`in resposne frontend ${response}`)
      //This means successful deletion
      if (response.status === 204){
        const updatedUserBlogs = userBlogs.filter(element => element.id !== latestBlog)
        console.log(updatedUserBlogs)
        setUserBlogs(updatedUserBlogs)

        //After deleting a blog, we need to update the local storage so when we refresh, it saves
        window.localStorage.setItem("userBlogs", JSON.stringify(updatedUserBlogs)); 
      }
    }
  };

  //Run the error notifcation if sucess state becomes true. This value is set if we fail to 
  //Retrieve the right user 
  if (user === null) {
    return (
      <>
        {success === true && <ErrorNotification/>}
        {loginForm()}
      </>
    )
    ;
  }

  return (
    <div>
      {added === true && <Notification/>}


      <h2>Blogs by {user.username} </h2>
      <h3> {user.username} logged in 
        <button onClick={logout}> logout </button>
      </h3>
      {userBlogs.map((element) => (
        <Blog key={element.id} {...element} />
      ))}
      {blogForm()}
      <button onClick={deleteLatest}> Delete latest blog </button>
    </div>
  );
};

export default App;
