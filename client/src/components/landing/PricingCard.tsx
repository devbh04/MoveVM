import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  onButtonClick?: () => void;
  delay?: number;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  period,
  description,
  features,
  isPopular = false,
  buttonText,
  onButtonClick,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`relative flex flex-col h-full ${
        isPopular
          ? 'scale-105 z-10 border-2 border-yellow-500/50'
          : 'border border-gray-800'
      } bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex-1">
        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
        <p className="text-gray-400 text-sm mb-6">{description}</p>

        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {price}
            </span>
            {period && (
              <span className="text-gray-400 text-lg ml-2">{period}</span>
            )}
          </div>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onButtonClick}
        className={`w-full ${
          isPopular
            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
        } font-semibold py-6 rounded-xl transition-all duration-300`}
      >
        {buttonText}
      </Button>
    </motion.div>
  );
};

