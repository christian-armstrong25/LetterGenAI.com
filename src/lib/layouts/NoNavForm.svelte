<script>
    import { navigate } from 'svelte-navigator';
    let sectionStyle = "custom";
    let uploadedResumes = [1];
    let selectedResume = uploadedResumes[uploadedResumes.length - 1];
    let additionalNotes = '';
    let jobDescription = '';
    let styleSelection;

    function selectStyle(style) {
        sectionStyle = style;
    }

    function selectDefaultStyle(style) {
        styleSelection = style;
    }
</script>

<style>
    #app {
        background-color: #22385F;
        font-family: 'Roboto', sans-serif;
		margin:0;
		padding:0;
        padding-top:0.5rem;
        width:100vw;
        height:100vh;
    }
    .form-container {
        background-color: white;
        max-width: 43rem; 
        margin: 0rem auto; 
        padding: 2em;
		padding-top:0rem;
        height: 93.5vh; 
        overflow: auto; 
    }
    .form-container h1 {
        font-size: 1.4rem;
        text-align: center; 
        margin-bottom: 0;
		padding-top:0.7rem;
		margin-top:0;
		padding-bottom:0;
    }
    .section h2 {
        font-size: 1.1rem;
        color: #000;
        margin-bottom: 0.5em;
		margin-top:0;
    }
    .section {
        margin-bottom: 1rem;
        padding: 1em; 
		margin-top:0rem;
		padding-top:0rem;
        border-radius: 5px; 
    }
    .toggle-button button {
        border: solid 1px;
        padding: 0.2rem 1em;
        border-radius: 0;
		font-size:0.9rem;
		margin-top:1rem;
		margin-bottom:0.5rem;
        cursor:pointer;
    }
    .toggle-button button:first-child {
        border-top-left-radius: 1rem;
        border-bottom-left-radius: 1rem;
    }
    .toggle-button button:last-child {
        border-top-right-radius: 1rem;
        border-bottom-right-radius: 1rem;
    }
    .toggle-button {
        display: flex;
    }
	.custom-style{
		margin-top:1rem;
	}

    .custom-style input[type="file"], 
    .custom-style textarea,
    .base-style ul {
        margin-top: 0em;
    }
    .base-style ul li {
        list-style-type: none;
    }
    .generate-button {
        background-color: #0C44A5;
        color: white;
        padding: 0.9em 2rem;
        display: block;
        margin: 0 auto;
		border:none;
        font-size:0.9rem;
        cursor:pointer;
    }
    select {
        color: #125208;
        border-color: #125208;
        background-color: #F1FFF4;
		font-size:0.8rem;
		border:solid 0.1rem;
		padding-top:0.25rem;
		padding-bottom:0.25rem;
    }
    .required-star {
        color: red;
    }

	p{
		font-size:0.79rem
	}
	
	textarea{
		font-size: 0.7rem;
		font-family: 'Roboto', sans-serif;
		padding:0.2rem;
		width:15rem;
		height:2rem;
	}

	#additional-label{
		padding:0;
		margin:0;
        margin-bottom:0.25rem;
	}

	.style-or{
		padding-top:0.5rem;
		padding-bottom:0.5rem;
		margin:0;
		font-size:0.65rem;
	}

	.sample-paste{
		padding:0.2rem;
		margin:0;
		width:12rem;
		height:2rem;
	}

	.file-upload button{
    display:flex;
    justify-content: space-between;
    align-items: center;
    width:12rem; 
    height:1.6rem;
    font-size:0.75rem;
    border-radius: 0;
    border: none;
    cursor: pointer;
	background-color: #D9D9D9;
}

.file-upload button img {
    width: 1.2rem; /* Adjust this size according to the logo size you want */
}

.file-upload button .logo-container {
    padding: 0rem;
    margin-right: 0rem;
    margin-left:0;
    padding-left:0.2rem;
}

.file-upload button .text-container{
    padding-right:0rem;
}

#choose{
	padding:0;
	margin:0;
}

.double{
	display:flex;
	justify-content: space-between;
	margin-right:12rem;
}

#upload-1{
	padding-right:2.3rem;
}

#style-sect{
	padding-top:1rem
}

#resume-upload button{
	width:7rem;
	padding-top:0rem;
	padding-bottom:0rem;
    font-size:0.6rem;
    height:1.4rem;
}

#additional{
    margin-bottom:0.2rem;
}

li{
		font-size:0.9rem;
        margin-right:2rem;
        padding-left:0;
        margin-left:0;
	}

    ul{
        padding-left:0rem;
        margin-left:0;
    }

    .padded{
        padding-bottom:1rem;
        padding-top:1rem;
    }

    .cursor{
        cursor:pointer;
    }

</style>

<div id="app">
    <div class="form-container">
        <h1>Create your Cover Letter</h1>
        <div class="section" id="style-sect" style="padding-top: {uploadedResumes.length === 0 ? '1rem' : '0rem'}; padding-bottom: {uploadedResumes.length === 0 ? '1.1rem' : '1rem'};">
            <h2>Style<span class="required-star">*</span></h2>
			<p id="choose">Choose from a number of default writing styles, or imitate your own by pasting in cover letters or writing samples. </p>
			<div class="toggle-button">
				<button on:click={() => selectStyle('custom')}
						style="color: {sectionStyle === 'custom' ? '#004896' : '#848484'};
							   border-color: {sectionStyle === 'custom' ? '#004896' : '#848484'};
							   background-color: {sectionStyle === 'custom' ? '#DCEDFF' : 'white'};
							   font-weight: {sectionStyle === 'custom' ? 'bold' : 'normal'}">
					Personalized Style
				</button>
				<button on:click={() => selectStyle('base')}
						style="color: {sectionStyle === 'base' ? '#004896' : '#848484'};
							   border-color: {sectionStyle === 'base' ? '#004896' : '#848484'};
							   background-color: {sectionStyle === 'base' ? '#DCEDFF' : 'white'};
							   font-weight: {sectionStyle === 'base' ? 'bold' : 'normal'}">
                               Pre-Selected Style
                            </button>
			</div>
            {#if sectionStyle === 'custom'}
			<div class="double">
                <div class="custom-style">
					<div class="file-upload">
						<button onclick="document.getElementById('getFile').click()">
							<div class="logo-container">
								<img src="/upload-icon.png" alt="Upload Icon" />
							</div>
							<div class="text-container" id="upload-1">
								Upload Sample #1
							</div>
						</button>
						<input type='file' id="getFile" style="display:none">
					</div>					
                    <p class="style-or">or</p>
                    <textarea placeholder="Paste your first writing sample here" class="sample-paste"></textarea>
                </div>
				<div class="custom-style">
					<div class="file-upload">
						<button onclick="document.getElementById('getFile').click()">
							<div class="logo-container">
								<img src="public/upload-icon.png" alt="Upload Icon" />
							</div>
							<div class="text-container">
								Upload Sample #2 (Optional)
							</div>
						</button>
						<input type='file' id="getFile" style="display:none">
					</div>					
                    <p class="style-or">or</p>
                    <textarea placeholder="Paste your first writing sample here (Optional)" class="sample-paste"></textarea>
                </div>
		</div>
            {:else}
            <div class="base-style">
                <ul>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="very_formal" on:click={() => selectDefaultStyle('very_formal')}/>
                      Very Formal
                    </label>
                  </li>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="enthusiastic" on:click={() => selectDefaultStyle('enthusiastic')}/>
                      Enthusiastic and Passionate
                    </label>
                  </li>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="narrative" on:click={() => selectDefaultStyle('narrative')}/>
                      Narrative-Oriented
                    </label>
                  </li>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="visionary" on:click={() => selectDefaultStyle('visionary')}/>
                      Visionary
                    </label>
                  </li>
                  <li>
                    <label class="cursor">
                      <input type="radio" name="style" value="precise" on:click={() => selectDefaultStyle('precise')}/>
                      Precise and Qualification-Driven
                    </label>
                  </li>
                </ul>
              </div>
              
            {/if}
        </div>


            <div class="section" style="padding-top: {uploadedResumes.length === 0 ? '0.5rem' : '0rem'}; padding-bottom: {uploadedResumes.length === 0 ? '1.1rem' : '1rem'};">
                <h2>Resume<span class="required-star">*</span></h2>
                {#if uploadedResumes.length > 0}
                <select bind:value={selectedResume}>
                    {#each uploadedResumes as resume (resume)}
                        <option id="resume-select-option" value={resume}>{resume === selectedResume ? `Selected: ${selectedResume}` : resume}</option>
                    {/each}
                </select>
                
                <p class="style-or">or</p>
                {/if}
                <div class="file-upload" id="resume-upload">
                    <button onclick="document.getElementById('getFile').click()">
                        <div class="logo-container">
                            <img src="public/upload-icon.png" alt="Upload Icon" />
                        </div>
                        <div class="text-container">
                            Upload New PDF
                        </div>
                    </button>
                    <input type='file' id="getFile" style="display:none">
                </div>  
            </div>


        <div class="section" style="padding-top: {uploadedResumes.length === 0 ? '0.5rem' : '0rem'}; padding-bottom: {uploadedResumes.length === 0 ? '1.1rem' : '1rem'};">
            <h2>Job Description<span class="required-star">*</span></h2>
            <textarea bind:value={jobDescription} placeholder="Paste the job description here"></textarea>
        </div>

        <div class="section" id="additional" style="padding-top: {uploadedResumes.length === 0 ? '0.5rem' : '0rem'}; padding-bottom: {uploadedResumes.length === 0 ? '1.1rem' : '1rem'};">
            <h2>Additional Notes (Optional)</h2>
            <p id="additional-label">Include any additional notes or ideas you want to highlight</p>
            <textarea bind:value={additionalNotes} placeholder="Any additional notes, e.g. “Highlight my data science skills and interest in public policy”"></textarea>
        </div>

        <button class="generate-button" on:click={() => navigate('/loading1')} style="margin-top: {uploadedResumes.length === 0 ? '1rem' : '0rem'};">Generate Letter</button>
    </div>
</div>
