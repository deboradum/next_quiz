import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import Create_input_div from 'components/create_input_div'
import { AiOutlinePlusCircle } from 'react-icons/Ai';
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Create() {
    let inputs:React.ReactElement[] = [];
    for (let i=0; i<10; i++) {
        inputs.push(<Create_input_div key={i}/>);
    }

    const [inputList, setInputList] = React.useState(inputs);

    function addInputField() {
        let newState = inputList.concat(<Create_input_div key={Math.random()}/>);
        setInputList(newState);
    }

    function createCards() {
        let cards:{ front: string, back: string }[] = [];
        let inputFields = Array.from(document.getElementsByClassName("inputDiv"));
        inputFields.forEach(element => {
            let frontText = element.getElementsByTagName('input')[0].value;
            let backText = element.getElementsByTagName('input')[1].value;
            if (frontText && backText) {
                cards.push({ front: frontText, back: backText });
            }
        });
        console.log(cards)
        return cards
    }

    function downloadCards() {
        let csv ='front,back\n';
        let cardList = createCards();
        cardList.forEach(c => {
            csv += c.front + ',' + c.back + '\n';
        });

        let download = document.createElement('a');
        download.href ='data:text/csv;charset=utf-8,' + encodeURI(csv);
        download.target ='_blank';
        download.download = 'learnNextCards.csv';
        download.click();
        console.log("Done")
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
                <div className='sm:w-full md:w-2/4 flex flex-col justify-around mx-auto'>
                    <div className='my-4'>
                        <div className='flex flex-row justify-around'>
                            <span className="text-md font-medium text-gray-700">Front</span>
                            <span className="text-md font-medium text-gray-700">Back</span>
                        </div>
                    </div>
                    {inputList}
                    <div className="my-1 rounded-md shadow-sm bg-white hover:bg-slate-100 hover:cursor-pointer py-2 px-4 self-end w-fit">
                        <span className='text-sm font-medium text-gray-700' onClick={addInputField}>Add</span>
                    </div>
                    <div className="my-1 rounded-md shadow-sm bg-white hover:bg-slate-100 hover:cursor-pointer py-2 px-10 self-center w-fit">
                        <span className='text-sm font-medium text-gray-700' onClick={downloadCards}>Download</span>
                    </div>
                    <Link className='self-center' href={'/learn'}>
                    <div className="mt-1 mb-20 rounded-md shadow-sm bg-white hover:bg-slate-100 hover:cursor-pointer py-2 px-10 w-fit">
                        <span className='text-sm font-medium text-gray-700' onClick={createCards}>Learn!</span>
                    </div>
                    </Link>

                </div>
            </div>
        </>
    )
}
