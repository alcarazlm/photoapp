import React from 'react';
import {
  Typography, Grid, Paper, TextField, Button
} from '@material-ui/core';
import axios from 'axios';
// import { response } from 'express';

class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login_name: "",
            register_name: "",
            login_password: "",
            password: "",
            password2: "",
            first_name: "",
            last_name : "",
            occupation: "", 
            location : "",
            description: "",
            login_error: "",
            register_error: ""

        };
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);

    }
    handleLogin() {
        axios.post('/admin/login', {login_name: this.state.login_name, password: this.state.login_password})
        .then(response => {
            let user = response.data;
            this.props.isLoggedIn(user);
            this.props.handleChange("Details of ", `${user.first_name} ${user.last_name}`);
            window.location.href = `#/users/${user._id}`;
        }).catch(err => {
            this.setState({login_error: err.response.data});});

    }
    handleRegister() {
        if (this.state.password !== this.state.password2) {
            this.setState({register_error: 'Passwords do not match!'});
            return;
        }
        axios.post('user/', {login_name: this.state.register_name,
        password: this.state.password,
        password2: this.state.password2,
        first_name: this.state.first_name,
        last_name : this.state.last_name,
        occupation: this.state.occupation, 
        location : this.state.location,
        description : this.state.description})
        .then(response => {
            let user = response.data;
            this.props.isLoggedIn(user);
            this.props.handleChange("Details of ", `${user.first_name} ${user.last_name}`);
            window.location.href = `#/users/${user._id}`;
        }).catch(err => {this.setState({register_error: err.response.data});});
    }
    


    render() {
        const paperstyle= {padding:20, height:'70vh', width:'50%', margin:"20px auto", display: "block", overflow: "auto" };
        // console.log("shit");
        return (
            <Grid container>
                <Paper elevation={10} style={paperstyle}>
                    <Grid container alignContent='center'>
                        Login
                    </Grid>
                    <TextField label='Username' placeholder='Enter Username' value={this.state.login_name}
                                onChange={(event) =>this.setState({login_name: event.target.value})} fullWidth required/>
                    <TextField label='Password' placeholder='Enter Password' value={this.state.login_password} type='password'
                                onChange={(event) => this.setState({login_password: event.target.value})} fullWidth required/>
                    <Typography>{this.state.login_error}</Typography>
                    <Button onClick={() => {this.handleLogin();}} fullWidth>Log In</Button>
                    <Grid container alignContent='center'>
                        <Typography>
                            Don&apos;t have an account?
                            <br/>
                            Register Below
                        </Typography>
                    </Grid>
                    <TextField label='Username' placeholder='Enter Username' value={this.state.register_name}
                                onChange={(event) =>this.setState({register_name: event.target.value})} fullWidth required/>
                    <TextField label='Password' placeholder='Enter Password' value={this.state.password} type='password'
                                onChange={(event) => this.setState({password: event.target.value})} fullWidth required/>
                    <TextField label='Verify Password' placeholder='Verify Your Password' value={this.state.password2} type='password'
                                onChange={(event) =>this.setState({password2: event.target.value})} fullWidth required/>
                    <TextField label='First Name' placeholder='Enter Your First Name' value={this.state.first_name}
                                onChange={(event) =>this.setState({first_name: event.target.value})} fullWidth required/>
                    <TextField label='Last Name' placeholder='Enter Your Last Name' value={this.state.last_name}
                                onChange={(event) => this.setState({last_name: event.target.value})} fullWidth required/>
                    <TextField label='Occupation' placeholder='Enter Occupation' value={this.state.occupation}
                                onChange={(event) => this.setState({occupation: event.target.value})} fullWidth/>
                    <TextField label='Location' placeholder='Enter Your Location' value={this.state.location}
                                onChange={(event) =>this.setState({location: event.target.value})} fullWidth/>
                    <TextField label='Description' placeholder='Enter a Description' value={this.state.description}
                                onChange={(event) => this.setState({description: event.target.value})} fullWidth/>
                    <Typography>{this.state.register_error}</Typography>
                    <Button onClick={() => {this.handleRegister();}} fullWidth>Register Me</Button>
                </Paper>
            </Grid>
        );}
}
export default LoginRegister;