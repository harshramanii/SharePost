# Compatibility shim for kconv library removed in Ruby 3.4+
# This provides minimal kconv functionality needed by CFPropertyList

module Kconv
  # Encoding constants
  AUTO = Encoding.find('UTF-8')
  EUC = Encoding.find('EUC-JP') rescue Encoding.find('UTF-8')
  SJIS = Encoding.find('Shift_JIS') rescue Encoding.find('UTF-8')
  BINARY = Encoding.find('ASCII-8BIT')
  ASCII = Encoding.find('US-ASCII')
  UTF8 = Encoding.find('UTF-8')
  UTF16 = Encoding.find('UTF-16BE') rescue Encoding.find('UTF-8')
  UTF32 = Encoding.find('UTF-32BE') rescue Encoding.find('UTF-8')
  UNKNOWN = Encoding.find('UTF-8')

  # Minimal implementation of kconv methods
  def self.toeuc(str)
    str.to_s.encode('EUC-JP', invalid: :replace, undef: :replace) rescue str.to_s
  end

  def self.tosjis(str)
    str.to_s.encode('Shift_JIS', invalid: :replace, undef: :replace) rescue str.to_s
  end

  def self.tojis(str)
    toeuc(str)
  end

  def self.toutf8(str)
    str.to_s.encode('UTF-8', invalid: :replace, undef: :replace) rescue str.to_s
  end

  def self.toutf16(str)
    str.to_s.encode('UTF-16BE', invalid: :replace, undef: :replace) rescue str.to_s
  end

  def self.guess(str)
    str.to_s.encoding
  end

  def self.isutf8(str)
    str.to_s.encoding == Encoding.find('UTF-8')
  end

  def self.iseuc(str)
    str.to_s.encoding == Encoding.find('EUC-JP') rescue false
  end

  def self.issjis(str)
    str.to_s.encoding == Encoding.find('Shift_JIS') rescue false
  end
end
