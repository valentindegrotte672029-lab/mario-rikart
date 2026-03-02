import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';

const FormattedNumber = ({ value }: { value: number }) => {
    return new Intl.NumberFormat('en-US').format(value);
};

export const ToadBank: React.FC = () => {
    const { coins, sobriety } = useAppStore();

    return (
        <div className="toad-bank-container">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="toad-bank-card"
            >
                {/* Decorative Grid Line */}
                <div className="toad-bank-line" />

                <div className="toad-bank-header">
                    <div className="toad-bank-balance-group">
                        <div className="toad-bank-coin spin-slow">
                            <span>$</span>
                        </div>
                        <div className="toad-bank-balance-text">
                            <span className="toad-bank-label">Toad Bank Balance</span>
                            <motion.span
                                key={coins}
                                initial={{ scale: 1.1, color: 'var(--neon-green)' }}
                                animate={{ scale: 1, color: 'var(--text-primary)' }}
                                className="toad-bank-amount"
                            >
                                $<FormattedNumber value={coins} />
                            </motion.span>
                        </div>
                    </div>

                    <div className="toad-bank-sobriety-group">
                        <span className="toad-bank-label glitch-text" data-text="SOBRIETY">SOBRIETY</span>
                        <div className="toad-bank-sobriety-val">{sobriety}%</div>
                    </div>
                </div>

                {/* Sobriety Progress Bar */}
                <div className="sobriety-bar-bg">
                    <motion.div
                        className="sobriety-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${sobriety}%` }}
                        transition={{ type: 'spring', stiffness: 50 }}
                        style={{
                            filter: sobriety < 30 ? 'contrast(200%) hue-rotate(-20deg)' : 'none'
                        }}
                    />
                </div>
            </motion.div>
        </div>
    );
};
