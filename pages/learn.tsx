import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import { parse } from 'path'
import React, { useEffect } from 'react'
import Learn_input_div from '@/components/learn_input_div'
import { stringify } from 'querystring'
import Create_input_div from '@/components/create_input_div'
import { createReadStream } from 'fs'
import Card_learn_front from '@/components/card_learn_front'
import Stats_cards from '@/components/stats_cards'

const inter = Inter({ subsets: ['latin'] })

export default function Learn() {
	const [toLearnList, settoLearnList] = React.useState([] as {front:string, back:string}[]);
	const [numRepititions, setNumRepititions] = React.useState(1);
	const [shuffleMode, setShuffleMode] = React.useState(true);
	const [caseSensitive, setCaseSensitive] = React.useState(false);
	const [learningCardsInfo, setLearningCardsinfo] = React.useState([] as {front:string, back:string, repsLeft:number}[])
	const [currentCard, setCurrentCard] = React.useState({front:"", back:""})
	const [stats, setStats] = React.useState([] as {front:string, back:string, num_wrongs:number}[])

	useEffect(() => {
		if (learningCardsInfo.length > 0) {
			newWord();
		}
	},[learningCardsInfo]
	)

	useEffect(() => {
		let cardspan = document.getElementById("card-span");
		if (cardspan) cardspan.innerHTML = currentCard.front;
	}, [currentCard])

	function setShuffleState() {
		if ((document.getElementById("shuffle_setter_on") as HTMLInputElement).checked) {
			setShuffleMode(true);
		} else if ((document.getElementById("shuffle_setter_off") as HTMLInputElement).checked) {
			setShuffleMode(false);
		}
	}

	function setCaseSensiState() {
		if ((document.getElementById("case_sensitive_on") as HTMLInputElement).checked) {
			setCaseSensitive(true);
		} else if ((document.getElementById("case_sensitive_off") as HTMLInputElement).checked) {
			setCaseSensitive(false);
		}
	}

	function setRepState() {
		let repititions = parseInt((document.getElementById("repititions_setter") as HTMLInputElement)?.value);
		if (isNaN(repititions) || repititions < 1 || repititions > 10) {
			repititions = 1;
		}
		setNumRepititions(repititions)
	}

	function parseFile(file: File) {
		return new Promise((resolve, reject) =>  {
			let cards:{front:string, back:string}[] = [...toLearnList];
			const reader = new FileReader();
			reader.onload = function (e) {
				const text = e.target?.result;
				const lines = (text as string).split('\n');
				lines.forEach((line) => {
					const frontBack = line.split(",");
					if (frontBack.length == 2) {
						let frontC = frontBack[0];
						let backC = frontBack[1];
						let c = { front: frontC, back: backC };
						cards.push(c);
					}
				});
				resolve(cards);
			};
			reader.readAsText(file);
		})

	}

	async function uploadCards() {
		const fileSelector = document.getElementById('file-selector');
		const fs = (fileSelector as HTMLInputElement).files
		if (fs != null && fs[0] != null) {
			document.getElementById("nothing-uploaded")?.remove()
			fileSelector?.classList.remove("text-red-400");
			fileSelector?.classList.add("text-gray-700");
			const f:File = fs[0];
			const cards = await parseFile(f) as {front:string, back:string}[];
			settoLearnList(cards);
		} else {
			fileSelector?.classList.add("text-red-400");
		}
	}

	function newWord() {
		document.getElementById("start-div")?.classList.add("hidden");
		document.getElementById("quiz-div-holder")?.classList.remove("hidden");
		document.getElementById("quiz-div-holder")?.classList.add("flex");
		document.getElementById("quiz-div-holder")?.classList.add("min-h-screen");

		let cardspan = document.getElementById("card-span");
		if (cardspan) cardspan.classList.remove("text-red-400");
		if (cardspan) cardspan.classList.remove("text-green-600");
		if (cardspan) cardspan.classList.add("text-white");

		if (learningCardsInfo.every(obj => obj.repsLeft == 0)) {
			if (cardspan) cardspan.innerHTML = "";
			document.getElementById("start-div")?.classList.add("hidden");
			document.getElementById("quiz-div-holder")?.classList.add("hidden");
			document.getElementById("stats-div")?.classList.remove("hidden");
			return
		}

		if (shuffleMode) {
			let cardList = [...learningCardsInfo];
			while (1) {
				let c = cardList[Math.floor(Math.random()*cardList.length)];
				let cCopy = Object.assign({}, c);
				if (c.repsLeft > 0){
					setCurrentCard(cCopy);
					break;
				}
			}

		} else {
			let cardList = [...learningCardsInfo];
			let c_index = cardList.findIndex(item => item.front === currentCard.front && item.back === currentCard.back);
			while (1) {
				let c = cardList[(c_index + 1) % cardList.length];
				if (c.repsLeft > 0) {
					let cCopy = Object.assign({}, c);
					setCurrentCard(cCopy);
					break;
				}
				c_index++;
			}
		}
	}

	function createLearningCards() {
		let cards:{front: string, back:string, repsLeft:number}[] = [];
		let cardsStats:{front: string, back:string, num_wrongs:number}[] = [];
		toLearnList.map(c => {
			const newC: {front: string, back:string, repsLeft:number} = {front:c.front, back:c.back, repsLeft:numRepititions};
			const newCS: {front: string, back:string, num_wrongs:number} = {front:c.front, back:c.back, num_wrongs:0};
			cards.push(newC);
			cardsStats.push(newCS);
		});
		setLearningCardsinfo(cards);
		setStats(cardsStats);
	}

	function check_answer() {
		const answer = (document.getElementById("learn-input") as HTMLInputElement).value;
		let cardspan = document.getElementById("card-span");
		if (cardspan) cardspan.innerHTML= currentCard.back;
		if (caseSensitive) {
			if (answer == currentCard.back) {
				if (cardspan) cardspan.classList.remove("text-red-400");
				if (cardspan) cardspan.classList.remove("text-white");
				if (cardspan) cardspan.classList.add("text-green-600");
				let cardList = [...learningCardsInfo];
				let c_index = cardList.findIndex(item => item.front === currentCard.front && item.back === currentCard.back);
				cardList[c_index].repsLeft--;
				document.getElementById("next-btn")?.addEventListener("click", () =>{
					setLearningCardsinfo(cardList);
					(document.getElementById("learn-input") as HTMLInputElement).value = "";
				}, {once : true});

			} else {
				if (cardspan) cardspan.classList.remove("text-green-600");
				if (cardspan) cardspan.classList.remove("text-white");
				if (cardspan) cardspan.classList.add("text-red-400");
				let cardList = [...learningCardsInfo];
				let cardStats = [...stats];
				let ci = cardStats.findIndex(item => item.front === currentCard.front && item.back === currentCard.back);
				cardStats[ci].num_wrongs++;
				setStats(cardStats);
				document.getElementById("next-btn")?.addEventListener("click", () =>{
					setLearningCardsinfo(cardList);
					(document.getElementById("learn-input") as HTMLInputElement).value = "";;
				}, {once : true});
			}
		} else {
			if (answer.toLowerCase() == currentCard.back.toLowerCase()) {
				if (cardspan) cardspan.classList.remove("text-red-400");
				if (cardspan) cardspan.classList.remove("text-white");
				if (cardspan) cardspan.classList.add("text-green-600");
				let cardList = [...learningCardsInfo];
				let c = cardList.findIndex(item => item.front === currentCard.front && item.back === currentCard.back);
				cardList[c].repsLeft--;
				document.getElementById("next-btn")?.addEventListener("click", () =>{
					setLearningCardsinfo(cardList);
					(document.getElementById("learn-input") as HTMLInputElement).value = "";
				}, {once : true});
			} else {
				if (cardspan) cardspan.classList.remove("text-green-600");
				if (cardspan) cardspan.classList.remove("text-white");
				if (cardspan) cardspan.classList.add("text-red-400");
				let cardList = [...learningCardsInfo];
				let cardStats = [...stats];
				let ci = cardStats.findIndex(item => item.front === currentCard.front && item.back === currentCard.back);
				cardStats[ci].num_wrongs++;
				setStats(cardStats);
				document.getElementById("next-btn")?.addEventListener("click", () =>{
					setLearningCardsinfo(cardList);
					(document.getElementById("learn-input") as HTMLInputElement).value = "";
				}, {once : true});
			}
		}
	}

  return (
    <>
      	<Head>
       		<title>LearnNext</title>
        	<meta name="description" content="Generated by create next app" />
        	<meta name="viewport" content="width=device-width, initial-scale=1" />
        	<link rel="icon" href="/favicon.ico" />
      	</Head>
		<div className='bg-slate-50 min-h-screen'>
			<div id='start-div' className='sm:w-full md:w-2/4 flex flex-col justify-around mx-auto'>
				<div className='my-4'>
					<div className='flex flex-row justify-around'>
						<span className="text-md font-medium text-gray-700">Front</span>
						<span className="text-md font-medium text-gray-700">Back</span>
					</div>
					<div id='text-div' className='flex flex-row justify-around'>

					</div>
				</div>
				{toLearnList.map(c => (
					<Learn_input_div {...c} key={Math.random()} />
				))}
				{/* Uploader */}
				<div className="relative mt-5 mb-1 rounded-md shadow-sm bg-white hover:bg-slate-100 hover:file:bg-slate-100 py-2 px-10 self-center w-80 group">
					<input className='text-sm text-gray-700 w-48 hover:cursor-pointer file:bg-white file:border-0 file:text-gray-700 file:font-medium group-hover:file:bg-slate-100' type="file" id="file-selector" accept=".csv"></input>
					<span className='text-sm font-medium text-gray-700 hover:cursor-pointer' onClick={uploadCards}>Upload</span>
				</div>
				{/* Repitition setter */}
				<div className='relative w-80 group my-1 rounded-md shadow-sm bg-white hover:bg-slate-100 hover:file:bg-slate-100 py-2 px-10 self-center group'>
					<span className='text-sm font-medium text-gray-700 hover:cursor-pointer'>Number of repititions:</span>
					<input id="repititions_setter" className='bg-white w-12 absolute right-12 text-gray-700 group-hover:bg-slate-100 text-sm' type="number" min="1" max="10" defaultValue="1" onChange={setRepState}/>
				</div>
				{/* Shuffle setter */}
				<div className='relative w-80 group my-1 rounded-md shadow-sm bg-white hover:bg-slate-100 hover:file:bg-slate-100 py-2 px-10 self-center group'>
					<span className='text-sm font-medium text-gray-700 hover:cursor-pointer'>Shuffle deck:</span>
					<div className='w-fit inline absolute right-12'>
						<input name='on_off_suffle' id="shuffle_setter_on" className='bg-white w-fit ml-12 text-gray-700 group-hover:bg-slate-100 text-sm' type="radio" defaultChecked onChange={setShuffleState} />
						<label className='text-sm font-medium text-gray-700 hover:cursor-pointer' htmlFor="shuffle_setter_on"> On</label>
						<input name='on_off_suffle' id="shuffle_setter_off" className='bg-white w-fit ml-12 text-gray-700 group-hover:bg-slate-100 text-sm' type="radio" onChange={setShuffleState} />
						<label className='text-sm font-medium text-gray-700 hover:cursor-pointer' htmlFor="shuffle_setter_off"> Off</label>
					</div>

				</div>
				{/* Case sensitive setter */}
				<div className='relative w-80 group my-1 rounded-md shadow-sm bg-white hover:bg-slate-100 hover:file:bg-slate-100 py-2 px-10 self-center group'>
					<span className='text-sm font-medium text-gray-700 hover:cursor-pointer'>Case sensitive:</span>
					<div className='w-fit inline absolute right-12'>
						<input name='on_off_case' id="case_sensitive_on" className='bg-white w-fit ml-12 text-gray-700 group-hover:bg-slate-100 text-sm' type="radio" onChange={setCaseSensiState} />
						<label className='text-sm font-medium text-gray-700 hover:cursor-pointer' htmlFor="case_sensitive_on"> On</label>
						<input name='on_off_case' id="case_sensitive_off" className='bg-white w-fit ml-12 text-gray-700 group-hover:bg-slate-100 text-sm' type="radio" defaultChecked onChange={setCaseSensiState} />
						<label className='text-sm font-medium text-gray-700 hover:cursor-pointer' htmlFor="case_sensitive_off"> Off</label>
					</div>
				</div>
				{/* Start button */}
				<div className='w-fit text-center mt-1 mb-20 rounded-md shadow-sm bg-white hover:bg-slate-100 hover:cursor-pointer py-2 px-10 self-center group' onClick={createLearningCards}>
					<span className='text-md font-medium text-gray-700 hover:cursor-pointer'>start</span>
				</div>
			</div>
			{/* Quiz mode div */}
			<div id='quiz-div-holder' className='hidden flex-col place-content-center justify-center conent-center items-center'>
				<Card_learn_front word={currentCard.front} f={check_answer} />
				<input id='learn-input' type="text" className='bg-white mt-8 py-2 sm:w-64 md:w-96 text-gray-700 rounded-md border focus:ring border-orange-300 px-7 focus:border-orange-300 focus:ring-orange-300 sm:text-sm text-center'>
				</input>
				<div id='next-btn' className='w-fit text-center mt-2 mb-20 rounded-md shadow-sm bg-white hover:bg-slate-100 hover:cursor-pointer py-2 px-10 self-center group'>
					<span className='text-md font-medium text-gray-700 hover:cursor-pointer'>next</span>
				</div>
			</div>
			{/* Stats div */}
			<div id='stats-div' className='hidden sm:w-full md:w-2/4 flex flex-col justify-around mx-auto'>
				<div className='my-4 flex flex-row justify-around'>
					<span className="text-md font-medium text-gray-700">Front</span>
					<span className="text-md font-medium text-gray-700">Errors</span>
					<span className="text-md font-medium text-gray-700">Back</span>
				</div>
				{stats.map(c => (
						<Stats_cards {...c} key={Math.random()} />
				))}
			</div>

		</div>

    </>
  )
}
