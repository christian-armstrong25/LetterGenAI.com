<script>
    import Navbar from '../components/Navbar.svelte';
    import { navigate } from 'svelte-navigator';
    // More Svelte code may be added here if needed.
</script>

<style>
/* Styles are identical as provided in the previous code */
    
    .signup-page {
        background-color: #22385F;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .white-box {
        background-color: white;
        width: 28rem;
        margin: auto;
        margin-top:1.5rem;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    h2{
        text-align: center;
        font-size: 1.8rem;
        padding-bottom:0.5rem;
    }

    form {
        display: flex;
        flex-direction: column;
        width:22rem;
    }
    
    form label {
        color: black;
        margin-bottom: 5px;
    }
    
    form input, form select {
        margin-bottom: 1rem;
        padding: 10px;
        background-color: #F6F6F6;
        border: 0.08rem solid black;
        border-radius: 0;
    }
    
    form button {
        padding: 1rem;
        color: white;
        background-color: #0C44A5;
        font-weight: bold;
        border: none;
        width: 60%;
        margin: auto;
        margin-top:1rem;
        text-transform: uppercase;
        border-radius: 0;
        cursor: pointer;
    }

    .signup-email-notification {
        font-size: 0.9rem;
        cursor: pointer;
    }

    .signup-email-notification input{
        border-radius: 0;
    }

    .new-account {
        text-align: center;
        margin-top: 30px;
        font-size: 0.9rem;
    }

    .required-field::after {
        content: "*";
        color: red;
    }
</style>

<Navbar />
<div class='signup-page'>
    <div class="white-box">
        <h2>Create your account</h2>
        <form>
            <label for="firstName" class="required-field">First Name</label>
            <input id="firstName" type="text" required />
            <label for="lastName" class="required-field">Last Name</label>
            <input id="lastName" type="text" required />
            <label for="email" class="required-field">Email</label>
            <input id="email" type="email" required />
            <label for="careerSearch">Target Job</label>
            <select id="careerSearch">
                <option>Internship</option>
                <option>Entry Level Job</option>
                <option>Mid-Career Job</option>
            </select>
            <label class="signup-email-notification"><input type="checkbox"> Receive email notifications</label>
            <button on:click={() => navigate('/form')}>Sign Up</button>
        </form>
        <p class="new-account">Already have an account? <a href="#" on:click={() => navigate('/login')}>Sign In</a></p>
    </div>
</div>
