import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	PromptTemplate,
} from "langchain/prompts";
import { STYLES } from "../utils/constants";

export function createLLMChain(promptTemplate: any, streaming = false) {
	const model = new ChatOpenAI({
		openAIApiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
		modelName: "gpt-4o-mini",
		streaming,
	});
	return new LLMChain({ llm: model, prompt: promptTemplate });
}

export function getGeneratePromptTemplate(name: string) {
	const basePrompt = `As a Career Advisor, you are tasked with constructing a powerful cover letter for a student, ${name}. The goal is to seamlessly blend their resume, job description, and personal voice into a meaningful narrative that echoes with both sincerity and relevance.
Here is their resume: '{resume}'
And the job description: '{jobDescription}'
Step 1: Introduction: Using ${name}'s resume and job description, write an engaging introduction that shows their interest in the role, as well as their understanding of the company's mission or recent initiatives. Keep their enthusiasm for the role and alignment with their qualifications in focus.
Step 2: Interests and Skills: Align ${name}'s qualifications with their interests and job requirements. Highlight a project or experience where ${name} applied skills that satisfy the job's needs and also connect with their passions. Include quantifiable results to showcase the impact of their work and demonstrate how these experiences prepare ${name} for this role.
Step 3: Potential: What sets ${name} apart? Elucidate how their past experiences, fueled by their interests and qualifications, will bring substantial value to the company. Be specific—how will ${name}'s skills, achievements, and interest in the field fulfill the company's needs? Incorporate elements of ${name}'s personality and motivations that make them an excellent cultural fit for the company.
Step 4: Conclusion: Craft a closing paragraph that expresses gratitude for the reader's time, ${name}'s desire to further discuss in an interview, and their excitement about the contributions they can make.
Step 5: Professional Sign-off: Conclude with 'Sincerely, ${name}'.
${name} would like their letter to be crafted in a qualification-focused style. This requires the ability to create a cover letter that is professional, engaging, and effectively encapsulates ${name}'s qualifications, interests, and potential. The greeting should be 'Dear Hiring Manager,' '{additionalNotes}'`;

	return PromptTemplate.fromTemplate(basePrompt);
}

export function getReviewPromptTemplate(
	letter: string,
	style: string,
	name: string,
	writingSamplesData: any,
	writingSample1Id: string,
	writingSample2Id: string
) {
	if (style === STYLES.SAMPLE_1 || style === STYLES.SAMPLE_2) {
		const sample1Id = writingSamplesData[writingSample1Id]?.fileName || "";
		const sample2Id = writingSamplesData[writingSample2Id]?.fileName || "";
		return PromptTemplate.fromTemplate(
			`Your task is to revise the provided cover letter '{letter}' to match the writing style and tone of writing samples 1 and 2. Your response should clearly identify the key characteristics of the writing style and tone present in '${sample1Id}' and '${sample2Id}'. You should strive to incorporate these characteristics into your revised cover letter without compromising the overall professionalism and clarity of the letter.
Please note that your revised cover letter should remain faithful to the original content and purpose of the letter, while also reflecting the requested writing style and tone. You should pay close attention to grammar, spelling, and punctuation, and ensure that the revised letter is free of errors. Please remove everything above the greeting, replace the greeting with 'Dear Hiring Manager', and replace everything below 'Sincerely' with '${name}' Ensure it keeps a professional, precise tone, and showcases qualifications accurately. Opt for clear, straightforward language, and focus on concrete descriptions and actions. Strive for direct communication without excessive praise or emotion. Include no text above Dear Hiring Manager.`
		);
	} else if (style === STYLES.PRECISE) {
		return PromptTemplate.fromTemplate(
			`You've received the cover letter: '{letter}'
As a cover letter coach, your role is to revise this draft so that it presents ${name} as genuinely interested in the company and the job role. Ensure it keeps a professional, precise tone, and showcases qualifications accurately. Opt for clear, straightforward language, and focus on concrete descriptions and actions. Strive for direct communication without excessive praise or emotion. Include no text above Dear Hiring Manager.`
		);
	}
}

export async function generateCoverLetter(
	resume: string,
	jobDescription: string,
	additionalNotes: string,
	name: string
) {
	const promptTemplate = ChatPromptTemplate.fromPromptMessages([
		HumanMessagePromptTemplate.fromTemplate(
			await getGeneratePromptTemplate(name).format({
				resume,
				jobDescription,
				additionalNotes,
				name,
			})
		),
	]);

	const chain = createLLMChain(promptTemplate);
	const response = await chain.call({
		resume,
		jobDescription,
		additionalNotes,
		name,
	});
	return response.text;
}

export async function reviewCoverLetter(
	letter: string,
	style: string,
	name: string,
	writingSamplesData: any,
	writingSample1Id: string,
	writingSample2Id: string,
	onToken: (token: string) => void
) {
	const promptTemplate = ChatPromptTemplate.fromPromptMessages([
		HumanMessagePromptTemplate.fromTemplate(
			await getReviewPromptTemplate(
				letter,
				style,
				name,
				writingSamplesData,
				writingSample1Id,
				writingSample2Id
			).format({
				letter,
				name,
			})
		),
	]);

	const chain = createLLMChain(promptTemplate, true);
	await chain.call(
		{ letter },
		[
			{
				handleLLMNewToken(token) {
					onToken(token);
				},
			},
		]
	);
}
