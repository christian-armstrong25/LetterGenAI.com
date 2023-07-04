<script>
    import { navigate } from 'svelte-navigator';
    let showOverlay = false;

    function goToHome() {
        navigate('/home');
    }

    function toggleOverlay() {
        showOverlay = !showOverlay;
    }
</script>

<style>
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: white;
    padding: 0rem; /* Remove padding */
    margin: 0; /* Remove margin */
}

.nav-left {
    display: flex;
    align-items: center;
}

#logo {
    max-width: 12%; /* Smaller logo */
    height: auto;
    padding-left:1.2rem;
    padding-top:0.5rem;
    padding-bottom:0.5rem;
    cursor: pointer; /* Makes it clear that logo is clickable */
}

.nav-left h1 {
    margin-left: 10px;
    cursor: pointer; /* Makes it clear that the text is clickable */
}

.nav-right {
    margin-right: 10px;
}

#account {
    border: 0.2rem solid #0C44A5; /* Bigger stroke */
    border-radius: 0.4rem;
    background-color: transparent;
    color: #0C44A5;
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    font-size: 1rem;
    font-weight:500;
    cursor: pointer;
    margin:0;
    margin-right:0.5rem;
}

.overlay {
    display: none;
    position: absolute;
    background-color: white;
    border: 1px solid #ddd;
    padding: 10px;
    width: 9rem;
    height:3.2rem;
    z-index: 100;
    font-size:0.9rem;
}

.overlay.show {
    display: block;
}

.overlay-button {
        display: block;
        cursor: pointer;
        margin-bottom: 10px;
    }

#btn2{
    border-top: 1px solid black; /* Add a thin black line */
    padding-top:0.5rem;
}
</style>

<nav>
    <div class="nav-left" on:click={() => navigate('/')}>
        <img src="/LetterGen.svg" alt="LetterGen Logo" id="logo">
        <h1>LetterGenAI</h1>
    </div>
    <div class="nav-right">
        <button id="account" on:click={toggleOverlay}>My Account</button>
        <div class="overlay {showOverlay ? 'show' : ''}">
            <span class="overlay-button" on:click={() => navigate('/settings')}>Account Settings</span>
            <span id="btn2" class="overlay-button" on:click={() => { /* account settings functionality here */ }}>Log Out</span>
        </div>
    </div>
</nav>
