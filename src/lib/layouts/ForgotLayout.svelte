<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-navigator';
    import Navbar from '../components/Navbar.svelte';
    import { sendResetPasswordEmail } from "$plugins/firebase/auth.firebase"; 

    let email = '';
    let showConfirmation = false;

    async function sendResetEmail() {
        try {
            await sendResetPasswordEmail(email);
            showConfirmation = true;
        } catch (error) {
            console.error(error);
            alert('Error sending password reset email: ', error);
        }
    }

    onMount(() => {
        showConfirmation = false;
    });
</script>

<Navbar />
<div class='login-page'>
    <div class="white-box">
        <h2>Forgot Password</h2>
        <form>
            <label for="email">Email</label>
            <input id="email" type="email" bind:value={email} />

            {#if !showConfirmation}
                <button on:click|preventDefault={sendResetEmail}>Send Reset Email</button>
            {:else}
                <p>Password reset email has been sent. Please check your inbox.</p>
            {/if}
        </form>
        <p class="new-account">Remember your password? <a href="#" on:click={() => navigate('/login')}>Sign In</a></p>
    </div>
</div>


<style>
        .resend-code {
        background-color: transparent;
        color: #0C44A5;
        border: none;
        font-size: 0.9rem;
        margin-top: 0.5rem;
        cursor: pointer;
        text-decoration: underline;
    }

.login-page {
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
        margin-top:3rem;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center; /* Center align the image with the form */
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
    
    form input {
        margin-bottom: 10px;
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
    
    form a {
        color: #0026EE;
        text-decoration: underline;
        text-align: center;
        margin-top: 10px;
    }
    
    .google-sign-in {
        text-align: center;
        margin-top: 2rem;
        color: rgb(96, 96, 96);
        font-size: 0.8rem;
    }
    
    .new-account {
        text-align: center;
        margin-top: 30px;
        font-size: 0.9rem;
    }
    
    .new-account a {
        color: #0026EE;
        text-decoration: underline;
    }
    .google-sign-in-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        background-color: #4E86EC;
        padding: 0.2rem 0rem;
        padding-top:0.2rem;
        padding-bottom:0rem;
        padding-left:0;
        width: 47%;
        margin: auto;
        margin-top:0.5rem;
        border: none;
        border-radius: 0;
        cursor: pointer;
    }

    .google-sign-in-btn img {
        width: 2.2rem; /* Adjust this size according to the logo size you want */
    }

    .google-sign-in-btn .logo-container {
        padding: 0rem;
        margin-right: 0rem;
        margin-left:0;
        padding-left:0.2rem;
    }

    .google-sign-in-btn .text-container{
        padding-right:1.7rem;
        font-size:0.85rem;
    }

    .forgot-password {
        text-decoration: underline;
        color: #0026EE;
        font-size: 0.85rem; /* Decreased font size */
        margin-top: 0rem; /* Adjust as needed */
        margin-bottom: 0; /* Adjust as needed */
        text-align: right; /* Center align the text */
    }

    .stay{
        margin-top:-0.4rem;
        font-size: 0.9rem;
        cursor: pointer;
    }

    .stay input{
        border-radius: 0;
    }

</style>
