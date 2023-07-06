<script>
  import { onMount } from 'svelte';
  import Navbar from '../components/Navbar.svelte';
  import { getUserData, deleteAccount, upgradePlan} from "$plugins/firebase/auth.firebase";
  import { navigate } from 'svelte-navigator';
  let user;
  let firstName = "";
  let lastName = "";

  onMount(async () => {
    user = await getUserData();
    console.log(user?.displayName)
    if (user?.displayName) {
      let names = user.displayName.split(' ');
      firstName = names[0];
      lastName = names.length > 1 ? names.slice(1).join(' ') : '';
    }
  });

  async function handleDeleteAccount() {
  let password = prompt('Please enter your password for confirmation:');

  if (password) {
    try {
      await deleteAccount(password);
      navigate('/')
    } catch(error) {
      console.error('Error in reauthentication', error);
    }
  } else {
    console.error('Password is required for account deletion');
  }
}

  async function handleUpgradePlan() {
    await upgradePlan();
    // navigate to billing or home page
  }

  async function enableEmailNotifications() {
    // navigate to billing or home page
  }

</script>
  <Navbar/>
  <div class="all">
    <div class="container">
      <h1>Account Settings</h1>
  
      <div class="white-box">
        <h2>My Plan</h2>
        <div class="subtitle">
          <img class="logo" src="LetterGen.ico" alt="Logo" />
          <h4>Free Plan</h4>
          <button class="upgrade-button" on:click={handleUpgradePlan}>Upgrade Plan</button>
        </div>
      </div>
  
      <div class="white-box">
        <h2>Personal Information</h2>
        <input type="text" value={firstName} readonly style="border: none; border-radius: 0; background-color: #F5F5F5; padding: 10px; width: 7rem;" />
        <input type="text" value={lastName} readonly style="border: none; border-radius: 0; background-color: #F5F5F5; padding: 10px; width: 7rem;" />
        <input type="text" value={user?.email} readonly style="border: none; border-radius: 0; background-color: #F5F5F5; padding: 10px; width: 14rem;" />
      </div>
  
      <div class="white-box">
        <div class="subtitle">
          <h2>Account</h2>
        </div>
        <label class="toggle-label">
          <input type="checkbox" />
          Enable Email Notifications
        </label>
        <div style="display: flex; align-items: center;">
          <p style="margin-right: 10px;">This action is permanent and cannot be undone</p>
          <button class="delete-button" on:click={handleDeleteAccount}>Delete Account</button>
        </div>
      </div>
    </div>
  </div>
  
  <style>
    /* styles.css */
    .all {
      margin: 0;
      padding: 0;
      background-color: #F5F5F5;
      height: 100vh;
    }
  
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
  
    h1 {
      margin: 0;
      padding-bottom: 5px;
      border-bottom: 1px solid black;
      text-align: center;
    }
  
    .white-box {
      background-color: white;
      padding: 20px;
      margin-top: 20px;
    }
  
    .subtitle {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  
    .logo {
      width: 50px;
      height: auto;
      margin-right: 10px;
      padding-left: 2rem;
    }
  
    .upgrade-button {
      margin-left: auto;
      background-color: #0C44A5;
      color: white;
      padding: 10px;
      border: none;
      margin-right: 1rem;
    }
  
    .toggle-label {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size:0.9rem;
    }
  
    .toggle-label input[type="checkbox"] {
      margin-right: 5px;
    }
  
    .delete-button {
      background-color: transparent;
      border: none;
      color: red;
      cursor: pointer;
      margin-left:5rem;
    }
  
    h2 {
      padding-top: 0;
      margin-top: 0;
    }

    p{
        font-size:0.9rem;
    }
  </style>
  