'use client';

import { useState } from 'react';
import { Store, Key, Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '@/lib/client/auth-utils';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
	const { login: setAuthLogin } = useAuth();
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			const response = await login(password);
			
			if (response.success && response.user) {
				// Update authentication state
				setAuthLogin({
					id: response.user.id,
					sessionId: response.user.sessionId || 'unknown',
					sessionType: response.user.sessionType || 'production'
				});
				
				// Use hard navigation to ensure server-side layout updates
				window.location.href = '/dashboard';
			} else {
				setError('Login failed. Please try again.');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed');
		} finally {
			setIsLoading(false);
		}
	};

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className='h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4'>
			<div className='w-full max-w-sm sm:max-w-md px-6 sm:px-8 py-8 sm:py-12 rounded-2xl shadow-lg bg-card relative overflow-hidden'>
				{/* Background pattern */}
				<div className='absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none'></div>

				{/* Login form container */}
				<div className='relative z-10'>
					{/* Logo */}
					<div className='flex flex-col items-center mb-6 sm:mb-8'>
						<div className='h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4'>
							<Store className='h-8 w-8 sm:h-10 sm:w-10 text-primary' />
						</div>
						<h1 className='text-2xl sm:text-3xl font-bold text-foreground text-center'>
							StoreFront
						</h1>
						<p className='text-muted-foreground mt-2 text-center text-sm sm:text-base'>
							Manager Access
						</p>
					</div>

					{/* Error message */}
					{error && (
						<div className='mb-4 sm:mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm'>
							{error}
						</div>
					)}

					{/* Login form */}
					<form onSubmit={handleLogin} className='space-y-4 sm:space-y-6'>
						<div className='space-y-2'>
							<div className='relative'>
								<label
									htmlFor='password'
									className='absolute -top-2 left-3 px-1 text-xs font-medium text-muted-foreground bg-card'>
									Manager Password
								</label>
								<div className='flex items-center'>
									<span className='absolute left-3 text-muted-foreground'>
										<Key className='h-4 w-4' />
									</span>
									<input
										id='password'
										type={showPassword ? 'text' : 'password'}
										value={password}
										onChange={e => setPassword(e.target.value)}
										className='w-full pl-9 pr-12 py-3 sm:py-3.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm sm:text-base'
										autoComplete='current-password'
										required
									/>
									<button
										type='button'
										onClick={toggleShowPassword}
										className='absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-1'>
										{showPassword ? (
											<EyeOff className='h-4 w-4' />
										) : (
											<Eye className='h-4 w-4' />
										)}
									</button>
								</div>
							</div>
						</div>

						{/* Submit button */}
						<button
							type='submit'
							className='w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-70 font-medium text-sm sm:text-base'
							disabled={isLoading || !password}>
							{isLoading ? (
								<>
									<div className='h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin'></div>
									<span>Logging in...</span>
								</>
							) : (
								<>
									<LogIn className='h-4 w-4' />
									<span>Login</span>
								</>
							)}
						</button>
					</form>

					{/* Footer */}
					<div className='mt-6 sm:mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground'>
						&copy; {new Date().getFullYear()} StoreFront Manager. All rights
						reserved.
					</div>
				</div>
			</div>
		</div>
	);
}
