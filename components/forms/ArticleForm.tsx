import React, { useState } from 'react'
import { Formik, FormikHelpers } from 'formik'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import { postArticle } from 'lib/calls'
import { ImageHandler } from '../ImageHandler'
import { FcAbout } from 'react-icons/fc'
import type { ArticleInputProps, ArticleProps, ImageProps } from 'types'

interface FormProps {
	author?: string
	title?: string
	perex?: string
	privateDoc?: boolean
	content?: string
	cloudinary_img?: { url?: string; id?: string }
	formTitle?: string
	submitCallback?: (inputs: ArticleInputProps) => Promise<void> | null
}

const handleValidation = (values: { title: string; perex: string; content: string; image: ImageProps }) => {
	const errors: any = {}
	if (!values.title) {
		errors.title = 'Required'
	}
	if (values.title.length > 80) {
		errors.title = 'Title must be less than 80 characters'
	}
	if (values.perex.length > 200) {
		errors.perex = 'Perex must be less than 200 characters'
	}
	if (values.content.length > 3000) {
		errors.content = 'Perex must be less than 3000 characters'
	}
	if (!values.content) {
		errors.content = 'Required'
	}
	return errors
}

const ArticleForm: React.FC<FormProps> = ({
	title = '',
	perex = '',
	privateDoc = false,
	content = '',
	cloudinary_img = { url: '', id: '' },
	formTitle = 'Create new article',
	submitCallback = null,
}) => {
	const Router = useRouter()
	const [markdown, setMarkdown] = useState(false)
	const imageRef = React.useRef<HTMLInputElement>(null)

	const toggleMarkdown = () => {
		setMarkdown((cur) => !cur)
	}

	const handleSubmit = async (inputs: ArticleInputProps, { setSubmitting }: FormikHelpers<ArticleInputProps>) => {
		if (submitCallback) {
			await submitCallback(inputs)
		} else {
			const res = (await postArticle(inputs)) as { success: boolean; data: ArticleProps }
			if (res?.success) {
				Router.push('/dashboard')
			} else {
				toast.error('Something went wrong')
			}
		}

		setSubmitting(false)
	}

	const tooltipMessage = 'This makes sure that only you can see this article'

	return (
		<Formik
			initialValues={{ title, perex, content, privateDoc, image: (cloudinary_img?.url || '') as ImageProps }}
			validate={handleValidation}
			onSubmit={handleSubmit}
		>
			{({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => {
				const titleError = touched.title && errors.title

				return (
					<form className="w-full max-w-xl m-auto mt-20" onSubmit={handleSubmit}>
						<div className="w-full flex items-center md:items-start flex-col">
							<h1>{formTitle}</h1>
						</div>

						<div className="flex mt-4 justify-center md:justify-end items-center">
							<div className="tooltip flex items-center" data-tip={tooltipMessage}>
								<label className="mr-1">Private</label>
								<FcAbout size={20} />
							</div>
							<input
								name="privateDoc"
								type="checkbox"
								className="toggle toggle-secondary ml-4"
								checked={values.privateDoc}
								onChange={handleChange}
							/>
						</div>

						<div className="mb-6 mt-10">
							<label htmlFor="title">Article title *</label>
							<input
								className={`input input-bordered w-full ${titleError && 'input-error'}`}
								type="text"
								name="title"
								placeholder="Title"
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.title}
							/>
							<p className="form-error">{titleError}</p>
						</div>
						<div className="mb-6">
							<ImageHandler image={values.image} ref={imageRef}>
								<label>Featured image *</label>
								<input
									ref={imageRef}
									type="file"
									name="image"
									className="hidden"
									accept="image/png, image/jpeg"
									onChange={(event: any) => {
										setFieldValue('image', event.currentTarget.files[0] as File)
									}}
								/>
							</ImageHandler>
							<p className="form-error">{touched.image && (errors as any).image}</p>
						</div>

						<div className="mb-6">
							<label htmlFor="perex">Perex</label>
							<input
								className="input input-bordered w-full"
								type="text"
								name="perex"
								placeholder="Perex"
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.perex}
							/>
							<p className="form-error">{touched.perex && errors.perex}</p>
						</div>
						<div className="mb-6">
							<div className="flex items-center">
								<label htmlFor="content">Content *</label>
								<label className="mr-4 ml-20"> Preview markdown:</label>
								<input type="checkbox" className="toggle" checked={markdown} onChange={toggleMarkdown} />
							</div>
							<div className="h-56 mt-2">
								{!markdown ? (
									<textarea
										className="textarea textarea-bordered resize-none w-full h-full"
										name="content"
										placeholder="Type something..."
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.content}
									/>
								) : (
									<ReactMarkdown className="whitespace-pre-wrap shadow appearance-none rounded h-full w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-not-allowed overflow-y-auto">
										{values.content}
									</ReactMarkdown>
								)}
								<p className="form-error">{touched.content && errors.content}</p>
							</div>
							<div className="flex justify-end">
								<button className="btn btn-secondary mt-2" type="submit" disabled={isSubmitting}>
									{!isSubmitting ? 'Submit' : 'Loading...'}
								</button>
							</div>
						</div>
					</form>
				)
			}}
		</Formik>
	)
}
export default ArticleForm
