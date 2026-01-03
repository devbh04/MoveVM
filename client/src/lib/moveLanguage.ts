// Move Language Syntax Definition

export const MOVE_KEYWORDS = [
  // Module and structure keywords
  'module', 'use', 'struct', 'fun', 'entry', 'public', 'private', 'native', 'const', 'friend', 'script',
  // Visibility modifiers
  'public(friend)', 'public(script)', 'public(package)',
  // Type keywords and abilities
  'has', 'key', 'store', 'copy', 'drop',
  // Resource keywords
  'acquires', 'phantom',
  // Control flow
  'if', 'else', 'while', 'loop', 'return', 'abort', 'break', 'continue',
  // Boolean
  'true', 'false',
  // Special
  'let', 'mut', 'move', 'as', 'spec', 'enum', 'match',
  // Testing
  'test', 'test_only',
];

export const MOVE_TYPES = [
  // Unsigned integers
  'u8', 'u16', 'u32', 'u64', 'u128', 'u256',
  // Signed integers (Move 2.0)
  'i8', 'i16', 'i32', 'i64', 'i128', 'i256',
  // Other primitives
  'bool', 'address', 'vector', 'signer', 'String',
];

export const MOVE_ATTRIBUTES = [
  '#[view]',
  '#[event]',
  '#[test]',
  '#[test_only]',
  '#[deprecated]',
  '#[bytecode_instruction]',
  '#[legacy_entry_fun]',
  '#[randomness]',
  '#[resource_group]',
  '#[resource_group_member]',
  '#[lint::skip]',
  '#[verify_only]',
];

export const MOVE_STD_LIB = [
  // Move standard library
  'std::signer',
  'std::error',
  'std::string',
  'std::vector',
  'std::option',
  'std::bcs',
  'std::hash',
  'std::fixed_point32',
  'std::fixed_point64',
  'std::bit_vector',
  'std::features',
  'std::acl',
  'std::cmp',
  'std::mem',
  'std::reflect',
  'std::result',
  // Aptos standard library
  'aptos_std::type_info',
  'aptos_std::math64',
  'aptos_std::math128',
  'aptos_std::math_fixed',
  'aptos_std::table',
  'aptos_std::table_with_length',
  'aptos_std::smart_table',
  'aptos_std::smart_vector',
  'aptos_std::simple_map',
  'aptos_std::copyable_any',
  'aptos_std::any',
  'aptos_std::string_utils',
  'aptos_std::debug',
  'aptos_std::from_bcs',
  'aptos_std::pool_u64',
  'aptos_std::ristretto255',
  'aptos_std::ed25519',
  'aptos_std::secp256k1',
  'aptos_std::multi_ed25519',
  'aptos_std::bn254_algebra',
  // Aptos framework
  'aptos_framework::coin',
  'aptos_framework::aptos_coin',
  'aptos_framework::aptos_account',
  'aptos_framework::account',
  'aptos_framework::event',
  'aptos_framework::timestamp',
  'aptos_framework::object',
  'aptos_framework::fungible_asset',
  'aptos_framework::primary_fungible_store',
  'aptos_framework::transaction_fee',
  'aptos_framework::staking_config',
  'aptos_framework::code',
  'aptos_framework::randomness',
  'aptos_framework::state_storage',
  'aptos_framework::storage_gas',
  'aptos_framework::transaction_context',
  'aptos_framework::chain_id',
  'aptos_framework::block',
  'aptos_framework::genesis',
];

export const MOVE_FUNCTIONS = [
  // Signer functions
  'signer::address_of',
  'signer::borrow_address',
  // Global storage functions
  'move_to',
  'move_from',
  'borrow_global',
  'borrow_global_mut',
  'exists',
  // Assertions
  'assert!',
  'abort',
  // Vector functions
  'vector::empty',
  'vector::length',
  'vector::push_back',
  'vector::pop_back',
  'vector::borrow',
  'vector::borrow_mut',
  'vector::destroy_empty',
  'vector::append',
  'vector::reverse',
  'vector::contains',
  'vector::index_of',
  'vector::remove',
  'vector::swap',
  'vector::singleton',
  'vector::for_each',
  'vector::for_each_ref',
  'vector::for_each_mut',
  // String functions
  'string::utf8',
  'string::bytes',
  'string::length',
  'string::append',
  'string::sub_string',
  'string::index_of',
  // Error functions
  'error::already_exists',
  'error::not_found',
  'error::invalid_argument',
  'error::out_of_range',
  'error::permission_denied',
  'error::aborted',
  'error::not_implemented',
  'error::unavailable',
  'error::unauthenticated',
  'error::invalid_state',
  'error::resource_exhausted',
  'error::cancelled',
  // Option functions
  'option::none',
  'option::some',
  'option::is_none',
  'option::is_some',
  'option::contains',
  'option::borrow',
  'option::borrow_mut',
  'option::extract',
  'option::destroy_none',
  'option::destroy_some',
  // BCS functions
  'bcs::to_bytes',
  'bcs::serialized_size',
  // Hash functions
  'hash::sha2_256',
  'hash::sha3_256',
  // Type info functions
  'type_info::account_address',
  'type_info::module_name',
  'type_info::struct_name',
  'type_info::type_name',
  'type_info::type_of',
  // Object functions
  'object::address_to_object',
  'object::create_object',
  'object::create_named_object',
  'object::object_from_constructor_ref',
  'object::generate_signer',
  'object::owner',
  'object::is_owner',
  // Event functions
  'event::emit',
  'event::emit_event',
  // Account functions
  'account::create_account',
  'account::create_signer_with_capability',
  'account::get_sequence_number',
  'account::rotate_authentication_key',
  // Timestamp functions
  'timestamp::now_seconds',
  'timestamp::now_microseconds',
  // Coin functions
  'coin::balance',
  'coin::transfer',
  'coin::withdraw',
  'coin::deposit',
  'coin::value',
  'coin::merge',
  'coin::extract',
];

export const MOVE_OPERATORS_KEYWORDS = [
  '::', '&', '*', '->', '=>', '==', '!=', '<=', '>=', '&&', '||', '!',
];

export const MOVE_OPERATORS = [
  '::', '&', '*', '->', '=>', '==', '!=', '<=', '>=', '&&', '||',
];

// Common Move code snippets for autocomplete
export const MOVE_SNIPPETS = {
  'module_template': {
    label: 'module',
    insertText: 'module ${1:address}::${2:module_name} {\n    $0\n}',
    detail: 'Create a new module',
  },
  'struct_template': {
    label: 'struct',
    insertText: 'struct ${1:StructName} has ${2:key, store} {\n    ${3:field}: ${4:type}\n}',
    detail: 'Create a new struct',
  },
  'function_template': {
    label: 'fun',
    insertText: 'public fun ${1:function_name}(${2:param}: ${3:type}): ${4:return_type} {\n    $0\n}',
    detail: 'Create a new function',
  },
  'entry_function': {
    label: 'entry fun',
    insertText: 'public entry fun ${1:function_name}(${2:account}: &signer) {\n    $0\n}',
    detail: 'Create an entry function',
  },
  'view_function': {
    label: '#[view] fun',
    insertText: '#[view]\npublic fun ${1:function_name}(${2:addr}: address): ${3:return_type} {\n    $0\n}',
    detail: 'Create a view function',
  },
  'test_function': {
    label: '#[test] fun',
    insertText: '#[test]\nfun ${1:test_name}() {\n    $0\n}',
    detail: 'Create a test function',
  },
  'acquires_function': {
    label: 'fun acquires',
    insertText: 'public fun ${1:function_name}(${2:param}: ${3:type}) acquires ${4:ResourceName} {\n    $0\n}',
    detail: 'Create a function that acquires a resource',
  },
  'event_struct': {
    label: '#[event] struct',
    insertText: '#[event]\nstruct ${1:EventName} has drop, store {\n    ${2:field}: ${3:type}\n}',
    detail: 'Create an event struct',
  },
  'assert_with_error': {
    label: 'assert! with error',
    insertText: 'assert!(${1:condition}, error::${2:error_type}(${3:ERROR_CODE}));',
    detail: 'Assert with error code',
  },
  'borrow_global_mut': {
    label: 'borrow_global_mut',
    insertText: 'let ${1:resource} = borrow_global_mut<${2:ResourceType}>(${3:addr});',
    detail: 'Borrow a mutable global resource',
  },
  'move_to': {
    label: 'move_to',
    insertText: 'move_to(${1:account}, ${2:ResourceName} {\n    ${3:field}: ${4:value}\n});',
    detail: 'Move a resource to an account',
  },
  'use_statement': {
    label: 'use',
    insertText: 'use ${1:address}::${2:module};',
    detail: 'Import a module',
  },
  'vector_operations': {
    label: 'vector operations',
    insertText: 'let ${1:vec} = vector::empty<${2:type}>();\nvector::push_back(&mut ${1:vec}, ${3:value});',
    detail: 'Common vector operations',
  },
};

// IntelliSense suggestions based on context
export interface AutocompleteSuggestion {
  label: string;
  kind: 'keyword' | 'type' | 'function' | 'module' | 'struct' | 'variable' | 'attribute' | 'snippet';
  detail?: string;
  insertText?: string;
}

export function getAutocompleteSuggestions(
  code: string,
  cursorLine: number,
  cursorColumn: number
): AutocompleteSuggestion[] {
  const suggestions: AutocompleteSuggestion[] = [];
  const lines = code.split('\n');
  const currentLine = lines[cursorLine - 1] || '';
  const beforeCursor = currentLine.substring(0, cursorColumn);
  
  // Get context from current line and previous lines
  const words = beforeCursor.trim().split(/\s+/);
  const lastWord = words[words.length - 1] || '';
  const previousWord = words.length > 1 ? words[words.length - 2] : '';
  
  // Get the full text before cursor for better context
  const allTextBeforeCursor = lines.slice(0, cursorLine - 1).join('\n') + '\n' + beforeCursor;
  
  // Check if we're in a comment
  if (currentLine.trim().startsWith('//') || beforeCursor.includes('//')) {
    return suggestions; // No suggestions in comments
  }
  
  // Detect if we're at the start of a line (after whitespace)
  const isLineStart = beforeCursor.trim() === '' || /^\s+$/.test(beforeCursor);
  
  // Check for attribute context (line starts with #)
  if (beforeCursor.trim().startsWith('#') || isLineStart) {
    MOVE_ATTRIBUTES.forEach(attr => {
      if (attr.toLowerCase().includes(lastWord.toLowerCase()) || isLineStart) {
        suggestions.push({
          label: attr,
          kind: 'attribute',
          detail: 'Move attribute',
          insertText: attr,
        });
      }
    });
  }
  
  // After "use " - suggest modules
  if (beforeCursor.match(/\buse\s+\w*$/)) {
    MOVE_STD_LIB.forEach(lib => {
      if (lib.toLowerCase().includes(lastWord.toLowerCase())) {
        suggestions.push({
          label: lib,
          kind: 'module',
          detail: 'Standard library module',
          insertText: lib,
        });
      }
    });
    
    // Also suggest common patterns
    if (!lastWord || 'std'.startsWith(lastWord.toLowerCase())) {
      suggestions.push({
        label: 'std::',
        kind: 'module',
        detail: 'Move standard library',
        insertText: 'std::',
      });
    }
    if (!lastWord || 'aptos_framework'.startsWith(lastWord.toLowerCase())) {
      suggestions.push({
        label: 'aptos_framework::',
        kind: 'module',
        detail: 'Aptos framework',
        insertText: 'aptos_framework::',
      });
    }
    if (!lastWord || 'aptos_std'.startsWith(lastWord.toLowerCase())) {
      suggestions.push({
        label: 'aptos_std::',
        kind: 'module',
        detail: 'Aptos standard library',
        insertText: 'aptos_std::',
      });
    }
  }
  
  // After "module " - suggest address format
  if (beforeCursor.match(/\bmodule\s+\w*$/)) {
    suggestions.push({
      label: '0x1::',
      kind: 'module',
      detail: 'Module address prefix',
      insertText: '0x1::',
    });
    suggestions.push({
      label: 'std::',
      kind: 'module',
      detail: 'Standard library address',
      insertText: 'std::',
    });
  }
  
  // After "struct " or inside struct - suggest abilities
  if (beforeCursor.match(/\bstruct\s+\w+\s+has\s+\w*$/) || 
      (previousWord === 'has' && allTextBeforeCursor.includes('struct'))) {
    const abilities = ['key', 'store', 'copy', 'drop'];
    abilities.forEach(ability => {
      if (ability.toLowerCase().includes(lastWord.toLowerCase())) {
        suggestions.push({
          label: ability,
          kind: 'keyword',
          detail: 'Struct ability',
          insertText: ability,
        });
      }
    });
  }
  
  // After "fun " - suggest common function modifiers
  if (previousWord === 'fun' || beforeCursor.match(/\b(public|private|entry)\s+fun\s*$/)) {
    suggestions.push({
      label: 'public entry fun',
      kind: 'snippet',
      detail: 'Public entry function',
      insertText: 'public entry fun ',
    });
    suggestions.push({
      label: 'public fun',
      kind: 'snippet',
      detail: 'Public function',
      insertText: 'public fun ',
    });
  }
  
  // After "error::" - suggest error types
  if (beforeCursor.endsWith('error::') || (previousWord === 'error::' && lastWord)) {
    const errorTypes = [
      'already_exists', 'not_found', 'invalid_argument', 'out_of_range',
      'permission_denied', 'aborted', 'not_implemented', 'unavailable',
      'unauthenticated', 'invalid_state', 'resource_exhausted', 'cancelled'
    ];
    errorTypes.forEach(errType => {
      if (errType.toLowerCase().includes(lastWord.toLowerCase())) {
        suggestions.push({
          label: `error::${errType}`,
          kind: 'function',
          detail: 'Error constructor',
          insertText: errType,
        });
      }
    });
  }
  
  // After "vector::" - suggest vector functions
  if (beforeCursor.endsWith('vector::') || (previousWord === 'vector::' && lastWord)) {
    const vectorFuncs = [
      'empty', 'length', 'push_back', 'pop_back', 'borrow', 'borrow_mut',
      'destroy_empty', 'append', 'reverse', 'contains', 'index_of', 'remove',
      'swap', 'singleton', 'for_each', 'for_each_ref', 'for_each_mut'
    ];
    vectorFuncs.forEach(func => {
      if (func.toLowerCase().includes(lastWord.toLowerCase())) {
        suggestions.push({
          label: `vector::${func}`,
          kind: 'function',
          detail: 'Vector function',
          insertText: func,
        });
      }
    });
  }
  
  // After "string::" - suggest string functions
  if (beforeCursor.endsWith('string::') || (previousWord === 'string::' && lastWord)) {
    const stringFuncs = ['utf8', 'bytes', 'length', 'append', 'sub_string', 'index_of'];
    stringFuncs.forEach(func => {
      if (func.toLowerCase().includes(lastWord.toLowerCase())) {
        suggestions.push({
          label: `string::${func}`,
          kind: 'function',
          detail: 'String function',
          insertText: func,
        });
      }
    });
  }
  
  // After "option::" - suggest option functions
  if (beforeCursor.endsWith('option::') || (previousWord === 'option::' && lastWord)) {
    const optionFuncs = [
      'none', 'some', 'is_none', 'is_some', 'contains', 'borrow',
      'borrow_mut', 'extract', 'destroy_none', 'destroy_some'
    ];
    optionFuncs.forEach(func => {
      if (func.toLowerCase().includes(lastWord.toLowerCase())) {
        suggestions.push({
          label: `option::${func}`,
          kind: 'function',
          detail: 'Option function',
          insertText: func,
        });
      }
    });
  }
  
  // Type suggestions after ":" in function parameters or struct fields
  if (beforeCursor.match(/:\s*\w*$/)) {
    MOVE_TYPES.forEach(type => {
      if (type.toLowerCase().includes(lastWord.toLowerCase())) {
        suggestions.push({
          label: type,
          kind: 'type',
          detail: 'Move type',
          insertText: type,
        });
      }
    });
    
    // Also suggest common generic types
    if ('vector'.includes(lastWord.toLowerCase())) {
      suggestions.push({
        label: 'vector<T>',
        kind: 'type',
        detail: 'Vector type',
        insertText: 'vector<>',
      });
    }
  }
  
  // General keyword suggestions when typing
  if (lastWord.length > 0) {
    MOVE_KEYWORDS.forEach(keyword => {
      if (keyword.toLowerCase().startsWith(lastWord.toLowerCase())) {
        suggestions.push({
          label: keyword,
          kind: 'keyword',
          detail: 'Move keyword',
          insertText: keyword,
        });
      }
    });
    
    MOVE_TYPES.forEach(type => {
      if (type.toLowerCase().startsWith(lastWord.toLowerCase())) {
        suggestions.push({
          label: type,
          kind: 'type',
          detail: 'Move type',
          insertText: type,
        });
      }
    });
    
    MOVE_FUNCTIONS.forEach(func => {
      if (func.toLowerCase().includes(lastWord.toLowerCase())) {
        suggestions.push({
          label: func,
          kind: 'function',
          detail: 'Move function',
          insertText: func,
        });
      }
    });
  }
  
  // Show common snippets when at line start or no specific context
  if (isLineStart || suggestions.length === 0) {
    // Add common code snippets
    Object.entries(MOVE_SNIPPETS).forEach(([, snippet]) => {
      if (!lastWord || snippet.label.toLowerCase().includes(lastWord.toLowerCase())) {
        suggestions.push({
          label: snippet.label,
          kind: 'snippet',
          detail: snippet.detail,
          insertText: snippet.insertText,
        });
      }
    });
    
    // Add common keywords for new lines
    if (isLineStart) {
      ['public', 'fun', 'struct', 'const', 'use', 'let'].forEach(kw => {
        suggestions.push({
          label: kw,
          kind: 'keyword',
          detail: 'Move keyword',
          insertText: kw,
        });
      });
    }
  }
  
  // Remove duplicates and limit results
  const uniqueSuggestions = Array.from(
    new Map(suggestions.map(s => [`${s.label}-${s.kind}`, s])).values()
  );
  
  return uniqueSuggestions.slice(0, 30); // Limit to 30 suggestions
}

// Syntax highlighting using regex patterns
export interface Token {
  type: 'keyword' | 'type' | 'string' | 'comment' | 'number' | 'operator' | 'function' | 'module' | 'default';
  value: string;
  start: number;
  end: number;
}

export function tokenizeMoveCode(code: string): Token[] {
  const tokens: Token[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, lineIndex) => {
    
    // Comments (single line)
    const commentMatch = line.match(/\/\/.*/);
    if (commentMatch && commentMatch.index !== undefined) {
      tokens.push({
        type: 'comment',
        value: commentMatch[0],
        start: lineIndex,
        end: lineIndex,
      });
    }
    
    // Multi-line comment
    const multiCommentMatch = line.match(/\/\*[\s\S]*?\*\//);
    if (multiCommentMatch && multiCommentMatch.index !== undefined) {
      tokens.push({
        type: 'comment',
        value: multiCommentMatch[0],
        start: lineIndex,
        end: lineIndex,
      });
    }
    
    // Strings
    const stringMatch = line.match(/"[^"]*"/);
    if (stringMatch && stringMatch.index !== undefined) {
      tokens.push({
        type: 'string',
        value: stringMatch[0],
        start: lineIndex,
        end: lineIndex,
      });
    }
    
    // Numbers
    const numberMatch = line.match(/\b\d+\b/);
    if (numberMatch && numberMatch.index !== undefined) {
      tokens.push({
        type: 'number',
        value: numberMatch[0],
        start: lineIndex,
        end: lineIndex,
      });
    }
    
    // Keywords
    MOVE_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      while (regex.exec(line) !== null) {
        tokens.push({
          type: 'keyword',
          value: keyword,
          start: lineIndex,
          end: lineIndex,
        });
      }
    });
    
    // Types
    MOVE_TYPES.forEach(type => {
      const regex = new RegExp(`\\b${type}\\b`, 'g');
      while (regex.exec(line) !== null) {
        tokens.push({
          type: 'type',
          value: type,
          start: lineIndex,
          end: lineIndex,
        });
      }
    });
    
    // Functions
    MOVE_FUNCTIONS.forEach(func => {
      const regex = new RegExp(`\\b${func.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      while (regex.exec(line) !== null) {
        tokens.push({
          type: 'function',
          value: func,
          start: lineIndex,
          end: lineIndex,
        });
      }
    });
    
    // Module paths (e.g., std::signer)
    const modulePathRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*(::[a-zA-Z_][a-zA-Z0-9_]*)+/g;
    let matchResult;
    while ((matchResult = modulePathRegex.exec(line)) !== null) {
      tokens.push({
        type: 'module',
        value: matchResult[0],
        start: lineIndex,
        end: lineIndex,
      });
    }
  });
  
  return tokens;
}

// Get CSS class for token type
export function getTokenClassName(tokenType: Token['type']): string {
  const classMap: Record<Token['type'], string> = {
    keyword: 'text-yellow-400',
    type: 'text-blue-400',
    string: 'text-green-400',
    comment: 'text-gray-500 italic',
    number: 'text-yellow-400',
    operator: 'text-orange-400',
    function: 'text-cyan-400',
    module: 'text-pink-400',
    default: 'text-slate-200',
  };
  return classMap[tokenType] || classMap.default;
}

