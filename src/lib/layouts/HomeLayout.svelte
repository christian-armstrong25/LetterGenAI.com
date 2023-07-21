<script>
	import Navbar from '../components/Navbar.svelte';
    import { user } from '$stores/user';


    let redirectTo = '/login';
    console.log($user)
  
  $: {
      if ($user) {
          redirectTo = '/form';
      } else {
          redirectTo = '/login';
      }
  }
    let string = 'Dear Hiring Manager,<br /><br />I am writing to express my sincere interest in the Data Science and Engineering intern position at Malwarebytes. As a Computer Science student at Brown University with a passion for data analysis and visualization, I am excited about the opportunity to contribute to Malwarebytes\' mission of ensuring cyber protection for everyone.<br /><br />From researching your company, I am inspired by Malwarebytes\' commitment to rid the world of malware and provide comprehensive solutions for device protection, privacy, and prevention. I admire the dedication of CEO Marcin Kleczynski and the entire team in creating a safer digital environment for individuals and organizations to thrive.<br /><br />With my background in data analysis and engineering, I am confident in my ability to excel in this role. During my time at The Environmental Equity Atlas, I developed the most comprehensive U.S. Environmental Justice data visualization policy tool. This project involved extensive data analysis and cleaning using Python, numpy, and pandas. I worked with data aggregated by reputable sources such as FEMA, the EPA, CDC, and the U.S. Census. Additionally, I gained experience in statistical analysis and visualization tools like Tableau.<br /><br />Furthermore, as a Data Visualization Engineer at Brown Daily Herald, I was solely responsible for developing data visualizations for the independent student-led newspaper. I created an admission dashboard that provided valuable insights and enhanced the user experience. This experience allowed me to sharpen my skills in data visualization and work collaboratively with a team.<br /><br />My coursework in Data Science at Brown University has provided me with a strong foundation in relevant technologies and techniques, including Python, SQL, beautifulsoup, numpy, and scikit learn. I have worked extensively with NLP, web scraping, databases, data cleaning, clustering techniques, regression, and machine learning. These skills have equipped me with the ability to assemble and analyze large, complex data sets to derive actionable insights.<br /><br />Beyond my technical qualifications, I bring strong analytical, quantitative, and problem-solving skills to the table. I thrive in fast-paced environments and possess excellent communication skills, enabling me to collaborate effectively with cross-functional teams. My attention to detail and passion for data-driven decision-making align perfectly with the goals of the Data Science and Engineering team at Malwarebytes.<br /><br />I am genuinely excited about the opportunity to contribute to Malwarebytes\' ongoing success and would be grateful for the chance to discuss how my skills and experiences can directly benefit the company. Thank you for considering my application. I look forward to the possibility of an interview to further discuss my qualifications.<br /><br />Sincerely,<br />Ty Pham-Swann';
    let words = string.split(/( |<br \/>)/);
    let index = 0;

    let interval;
    function addWord() {
        if (index < words.length) {
            coverLetter += words[index];
            index++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                // Reset the index and clear the div to restart the generation process
                index = 0;
                coverLetter = '';
                // Restart the interval
                interval = setInterval(addWord, 1);
            }, 1000); // Delay of 1 second
        }
    }

    let coverLetter = '';
    interval = setInterval(addWord, 1);  // Add a word every 1 ms

    import { navigate } from 'svelte-navigator';

    // ... rest of your script

	const redirectToLogin = () => {
  navigate(redirectTo);
};
</script>

<style>


.content {
    background-color: #F5F5F5;
    margin: 0; /* remove default margin */
}

.content {
    display: flex;
    justify-content: space-between;
    padding: 20px;
}

.left {
    flex: 1.6; /* takes up 2 portions of space */
    color: black;
    text-align: center;
}

.left h2 {
    color: black;
    text-align: center;
    margin-bottom: 0;
    font-size:2.4rem;
}

.left .tagline {
    color: #545454;
    text-align: center;
    margin-top: 0;
    margin-bottom: 20px; /* More distance */
}

.benefits {
    margin-left: 3rem; /* More padding */
    margin-right: 3rem; /* More padding */
    padding-top:2rem;
    text-align: left;
}

.benefits p{
    margin-left: 0rem; /* More padding */
    margin-right: 2rem; /* More padding */
    margin-bottom:1.75rem;
    font-size: 1.1rem;
    color: #333333;
}

.generate-btn {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

#generate {
    background-color: #0C44A5;
    color: white;
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    padding-top: 1.2rem;
    padding-bottom: 1.2rem;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    margin-top:5rem;
}

.right {
    flex: 1.4; /* takes up 2 portions of space */
    display: flex;
    flex-direction: column;
    align-items: center;
}

#process-img {
    max-width: 80%;
    height: auto;
    padding-top:2rem;
}

.cover-letter {
    width: 18rem;
    height: 24rem;
    background-color: white;
    margin-top: 20px;
    margin-right:5rem;
    padding: 2rem;
    padding-left: 3rem;
    padding-right: 2rem;
    padding-top:2.5rem;
    padding-bottom:2rem;
    font-size:0.38rem;
    line-height: 1.5; /* emulate Google Docs line spacing */
}





@media only screen and (max-width: 600px) {

    .content {
        flex-direction: column;
        padding: 10px;
    }

    .left, .right {
        flex: none;
    }

    .benefits, .generate-btn {
        margin-left: 1rem;
        margin-right: 1rem;
    }

    #process-img {
        max-width: 100%;
    }

    .cover-letter {
        width: 90%;
        margin-right:0;
    }
}
</style>
<Navbar/>
<div class="content">
    <div class="left">
        <h2>Your Personalized Cover Letter Writer</h2>
        <h2 class="tagline">Instant. Effortless. You.</h2>
        <div class="benefits">
            <p><b>1) Tailored to Your Unique Style:</b> Upload your writing samples for a cover letter that's authentically you.</p>
            <p><b>2) Instant Results:</b> Say goodbye to endless hours spent crafting the perfect letter. Your time is valuable, let us help you save it.</p>
            <p><b>3) Amplify Your Opportunities:</b> Boost your job applications with personalized, polished, and professional cover letters.</p>
        </div>
        <div class="generate-btn">
            <button id="generate" on:click={redirectToLogin}>Generate Your Cover Letter Now</button>
        </div>
    </div>
    <div class="right">
        <img src="/process.png" alt="Process" id="process-img">
        <div class="cover-letter" id="cover-letter">{@html coverLetter}</div>
    </div>
</div>